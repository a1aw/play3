var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    origins: "*:*"
});
var Party = require("./party");
var Player = require("./player");

server.listen(7692, () => {
    console.log("Now listening at port 7692.");
});

var parties = {};

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://www.playplayplay.ml");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/serverPage.html');
});

io.on('connection', function (socket) {
    socket.on("game", (data) => {
        if (!data.partyId || !data.playerId || !data.token) {
            return;
        }

        if (!parties[data.partyId]) {
            socket.emit("game", {
                event: "requestFailed",
                code: -1,
                msg: "No such party."
            });
            return;
        }

        var party = parties[data.partyId];

        var player = party.getPlayerById(data.playerId);

        if (!player) {
            socket.emit("game", {
                event: "requestFailed",
                code: -2,
                msg: "Player does not exist."
            });
            return;
        }

        if (player.token !== data.token || player.client.id !== socket.id) {
            socket.emit("game", {
                event: "requestFailed",
                code: -3,
                msg: "Authorization failed."
            });
            return;
        }

        if (!party.game || !party.game.isGameStarted()) {
            socket.emit("party", {
                event: "requestFailed",
                code: -4,
                msg: "No game available currently for requests."
            });
            return;
        }

        party.game.request(player, data.request);
    });
    socket.on("party", (data) => {
        if (data.event === "create") {
            if (!data.gameId || !data.playerName) {
                return;
            }

            var partyId = false;
            do {
                partyId = getRandomPartyId();
            } while (parties[partyId])
            console.log("New party: " + partyId);
            
            var player = new Player(getRandomMixedLetters(24), data.playerName, getRandomMixedLetters(64), socket);

            var party = new Party(partyId, () => {
                console.log("Disbanding party " + partyId);
                delete parties[partyId];
            });
            parties[partyId] = party;

            party.addPlayer(player);

            party.changeGame(data.gameId);

            socket.emit("party", {
                event: "partyJoined",
                player: player.getDescriptor(),
                token: player.token,
                party: party.getDescriptor()
            });
        } else if (data.event === "join") {
            if (!data.partyId || !data.playerName) {
                return;
            }

            if (!parties[data.partyId]) {
                socket.emit("party", {
                    event: "joinFailed",
                    code: -1,
                    msg: "No such party."
                });
                return;
            }

            var party = parties[data.partyId];

            if (party.isPlayerNameExist(data.playerName)) {
                socket.emit("party", {
                    event: "joinFailed",
                    code: -2,
                    msg: "The player nickname has already used by other players."
                });
                return;
            }

            var player = new Player(getRandomMixedLetters(24), data.playerName, getRandomMixedLetters(64), socket);

            if (party.addPlayer(player)) {
                socket.emit("party", {
                    event: "partyJoined",
                    player: player.getDescriptor(),
                    token: player.token,
                    party: party.getDescriptor()
                });
            } else {
                socket.emit("party", {
                    event: "joinFailed",
                    code: -3,
                    msg: "You have joined this party already."
                });
                return;
            }
        } else if (data.event === "gameInitReady" || data.event === "playerReady" || data.event === "playerUnready" || data.event === "startGame" || data.event === "addAi" || data.event === "kickPlayer") {
            if (!data.partyId || !data.playerId || !data.token) {
                return;
            }

            if (!parties[data.partyId]) {
                socket.emit("party", {
                    event: data.event + "Failed",
                    code: -1,
                    msg: "No such party."
                });
                return;
            }

            var party = parties[data.partyId];

            var player = party.getPlayerById(data.playerId);

            if (!player) {
                socket.emit("party", {
                    event: data.event + "Failed",
                    code: -2,
                    msg: "Player does not exist."
                });
                return;
            }

            if (player.token !== data.token || player.client.id !== socket.id) {
                socket.emit("party", {
                    event: data.event + "Failed",
                    code: -3,
                    msg: "Authorization failed."
                });
                return;
            }

            if (data.event === "addAi") {
                if (data.playerName !== "") {
                    var player = new Player(getRandomMixedLetters(24), data.playerName, getRandomMixedLetters(64), false);
                    player.online = false;
                    player.aiMode = true;
                    party.addPlayer(player);
                    socket.emit("party", {
                        event: data.event + "Success"
                    });
                    return;
                } else {
                    socket.emit("party", {
                        event: data.event + "Failed",
                        code: -6,
                        msg: "AI player name is missing or duplicated"
                    });
                    return;
                }
            }

            if (party.game.isGameStarted()) {
                socket.emit("party", {
                    event: data.event + "Failed",
                    code: -5,
                    msg: "The game has started."
                });
                return;
            }

            if (data.event === "gameInitReady") {
                party.gameInitReady(player);
            } else if (data.event === "playerReady") {
                party.playerReady(player);
            } else if (data.event === "playerUnready") {
                party.playerUnready(player);
            } else if (data.event === "startGame") {
                if (party.admin.id !== player.id) {
                    socket.emit("party", {
                        event: data.event + "Failed",
                        code: -4,
                        msg: "You are not the host."
                    });
                    return;
                }

                party.game.startGame();
                party.broadcastStartGame();
            } else if (data.event === "kickPlayer") {
                var kp = party.getPlayerById(data.playerId);

                if (!kp) {
                    socket.emit("party", {
                        event: data.event + "Failed",
                        code: -7,
                        msg: "No such player"
                    });
                    return;
                }

                if (!party.removePlayer(kp, false)) {
                    socket.emit("party", {
                        event: data.event + "Failed",
                        code: -8,
                        msg: "Could not remove player"
                    });
                    return;
                }
            }

            socket.emit("party", {
                event: data.event + "Success"
            });
        }
    });
});

function getRandomMixedLetters(len) {
    return getRandomLetters("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", len);
}

function getRandomPartyId() {
    return getRandomLetters("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);
}

function getRandomLetters(letters, len) {
    var text = "";
    for (var i = 0; i < len; i++) {
        text += letters[Math.floor(Math.random() * letters.length)];
    }
    return text;
}
