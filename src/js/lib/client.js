import io from 'socket.io-client';

export default class Client {

    constructor(endPoint) {
        this.endPoint = endPoint;
        this.player = false;
        this.party = false;
        this.token = false;
        this.ready = false;
        this.versionMatch = false;
        this.serverVersion = false;
        this.gameInitReadyList = {};
        this.playerReadyList = {};
        this.listeners = {};
        this.pendingRequests = [];
        this.initializeSocket();
    }

    initializeSocket() {
        this.socket = io(this.endPoint);
        this.socket.on("server", (data) => {
            if (data.event === "info") {
                this.serverVersion = data.version;
                if (data.version !== VERSION) {
                    this.askRefreshPage();
                } else {
                    this.versionMatch = true;
                    while (this.pendingRequests.length > 0) {
                        var req = this.pendingRequests.shift();
                        this.forceSocketEmit(req.event, req.data);
                    }
                }
                this.ready = true;
                this.dispatch("__ready");
            }
        });
        this.socket.on("party", (data) => {
            console.log(data);
            if (data.event === "partyJoined") {
                this.player = data.player;
                this.token = data.token;
                this.party = data.party;
            } else if (data.event === "gameInitReady") {
                this.gameInitReadyList = data.gameInitReady;
            } else if (data.event === "playerReady") {
                this.playerReadyList = data.playerReady;
            } else if (this.party && data.event === "playerListChanged") {
                this.party.players = data.players;
            } else if (this.party && data.event === "gameChanged") {
                this.party.gameId = data.gameId;
            } else if (this.party && data.event === "playerChanged") {
                console.warn("Handle player changed");
            } else if (this.party && data.event === "adminChanged") {
                this.party.admin = data.admin;
            }
            this.dispatch("party", data);
        });
        this.socket.on("game", (data) => {
            this.dispatch("game", data);
        });
        this.socket.on("chat", (data) => {
            this.dispatch("chat", data);
        });
        this.forceSocketEmit("server", {
            event: "info"
        });
    }

    on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off(event, listener) {
        if (!this.listeners[event]) {
            return false;
        }
        var array = this.listeners[event];
        var index = array.indexOf(listener);

        if (index === -1) {
            return false;
        }

        array.splice(index, 1);
        return true;
    }

    dispatch(event, data) {
        if (!this.listeners[event]) {
            return;
        }

        var array = this.listeners[event];
        for (var listener of array) {
            listener(data, this);
        }
    }

    askRefreshPage() {
        if (confirm("Your client version (" + VERSION + ") does not match with the server's version (" + this.serverVersion + "). This is probably due to a pending update for the app. Do you want to refresh the page and try again?")) {
            window.location = window.location.origin + "/?" + Date.now();
        }
    }

    forceSocketEmit(event, data) {
        this.socket.emit(event, data);
    }

    socketEmit(event, data) {
        if (!this.ready) {
            this.pendingRequests.push({
                event: event,
                data: data
            });
        } else {
            if (!this.versionMatch) {
                this.askRefreshPage();
                return;
            }
            this.forceSocketEmit(event, data);
        }
    }

    addAi(playerName) {
        this.socketEmit("party", {
            event: "addAi",
            token: this.token,
            playerId: this.player.id,
            partyId: this.party.partyId,
            playerName: playerName
        });
    }

    gameRequest(req) {
        this.socketEmit("game", {
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id,
            request: req
        });
    }

    createParty(nickName, gameId) {
        this.socketEmit("party", {
            event: "create",
            gameId: gameId,
            playerName: nickName
        });
    }

    joinParty(nickName, partyId) {
        this.socketEmit("party", {
            event: "join",
            partyId: partyId,
            playerName: nickName
        });
    }

    kickPlayer(playerId) {
        this.socketEmit("party", {
            event: "kickPlayer",
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id,
            kickPlayerId: playerId
        });
    }

    gameInitReady() {
        this.socketEmit("party", {
            event: "gameInitReady",
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id
        })
    }

    playerReady() {
        this.socketEmit("party", {
            event: "playerReady",
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id
        })
    }

    playerUnready() {
        this.socketEmit("party", {
            event: "playerUnready",
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id
        })
    }

    startGame() {
        this.socketEmit("party", {
            event: "startGame",
            token: this.token,
            partyId: this.party.partyId,
            playerId: this.player.id
        })
    }

}