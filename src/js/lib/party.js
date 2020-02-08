class Party {

    constructor(partyId, onDisband) {
        this.partyId = partyId;
        this.players = [];
        this.gameInitReadyList = {};
        this.playerReadyList = {};
        this.admin = false;
        this.game = false;
        this.onDisband = onDisband;
    }

    endGame() {
        if (!this.game) {
            return;
        }

        var gameId = this.game.gameId;

        this.game.disable();
        this.game = false;

        this.gameInitReadyList = {};
        this.playerReadyList = {};
        this.broadcastPlayerReady();
        this.broadcastGameInitReady();
        this.changeGame(gameId);        
    }

    playerReady(player) {
        this.playerReadyList[player.id] = true;
        this.broadcastPlayerReady();
    }

    playerUnready(player) {
        this.playerReadyList[player.id] = false;
        this.broadcastPlayerReady();
    }

    isAllPlayersReady() {
        for (var player of this.players) {
            if (player.online && !this.playerReadyList[player.id]) {
                return false;
            }
        }
        return true;
    }

    getPlayerById(playerId) {
        for (var player of this.players) {
            if (player.id === playerId) {
                return player;
            }
        }
        return false;
    }

    getDescriptor() {
        return {
            partyId: this.partyId,
            admin: this.admin.getDescriptor(),
            players: this.getPlayerDescriptors(),
            gameId: this.game ? this.game.gameId : false
        };
    }

    getPlayerDescriptors() {
        var descs = [];
        for (var player of this.players) {
            descs.push(player.getDescriptor());
        }
        return descs;
    }

    getFirstOnlinePlayer() {
        for (var player of this.players) {
            if (player.online) {
                return player;
            }
        }
        return false;
    }

    isPlayerJoined(player) {
        var index = this.players.indexOf(player);
        return index !== -1;
    }

    isPlayerNameExist(playerName) {
        for (var player of this.players) {
            if (player.name === playerName) {
                return true;
            }
        }
        return false;
    }

    disband() {
        clearTimeout(this.timeout);
        this.onDisband();
    }

    checkEmptyParty() {
        if (this.players.length === 0) {
            this.disband();
        } else {
            var online = false;
            for (var player of this.players) {
                online |= player.online;
            }

            if (!online) {
                this.disband();
            }
        }
    }

    addPlayer(player) {
        if (this.isPlayerJoined(player)) { // || (this.game && !this.game.isNewPlayersAllowed())) {
            return false;
        }
        if (!this.admin) {
            this.admin = player;
        }
        this.players.push(player);
        this.broadcastPlayerListChanged();

        if (player.client) {
            player.client.on("disconnect", () => {
                this.removePlayer(player);
                this.checkEmptyParty();
            });
        }
        
        return true;
    }

    removePlayer(player, aiMode = true) {
        if (this.isPlayerJoined(player)) {
            if (aiMode) {
                player.online = false;
                player.aiMode = true;
                this.broadcastPlayerChanged(player);

                if (!this.game &&
                    this.game.isGameStarted() &&
                    !this.game.isGameOver() &&
                    this.game.getTurnPlayer() &&
                    this.game.getTurnPlayer().id === player.id) {
                    this.game.request(player, this.game.onAi(player));
                }
            } else {
                //Remove player
                var index = -1;
                var i;
                for (i = 0; i < this.players.length; i++) {
                    if (this.players[i].id === player.id) {
                        index = i;
                    }
                }
                this.players.splice(index, 1);
                this.broadcastPlayerListChanged();
            }

            //Change admin
            if (this.admin === player) {
                var fo = this.getFirstOnlinePlayer();
                if (fo) {
                    this.admin = fo;
                    this.broadcastAdminChanged(this.admin);
                } else {
                    this.admin = false;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    changeAdmin(player) {
        if (isPlayerJoined(player) && player.online) {
            this.admin = player;
            this.broadcastAdminChanged(player);
            return true;
        } else {
            return false;
        }
    }

    changeGame(gameId) {
        if (!this.game || this.game.isGameOver()) {
            if (this.game) {
                this.game.disable();
            }
            this.gameInitReadyList = {};
            var Game = require("./games/game-" + gameId);

            this.game = new Game(this);
            this.game.enable();
            this.broadcastGameChanged(gameId);
        } else {
            return false;
        }
    }

    gameInitReady(player) {
        this.gameInitReadyList[player.id] = true;
        this.broadcastGameInitReady();
    }

    broadcastStartGame() {
        this.broadcastPartyEvent({
            event: "startGame"
        });
    }

    broadcastPlayerReady() {
        this.broadcastPartyEvent({
            event: "playerReady",
            playerReady: this.playerReadyList
        });
    }

    broadcastAdminChanged(admin) {
        this.broadcastPartyEvent({
            event: "adminChanged",
            admin: admin.getDescriptor()
        });
    }

    broadcastPlayerChanged(player) {
        this.broadcastPartyEvent({
            event: "playerChanged",
            player: player.getDescriptor()
        });
    }

    broadcastPlayerListChanged() {
        this.broadcastPartyEvent({
            event: "playerListChanged",
            players: this.getPlayerDescriptors()
        });
    }

    broadcastGameChanged(gameId) {
        this.broadcastPartyEvent({
            event: "gameChanged",
            gameId: gameId
        });
    }

    broadcastGameInitReady() {
        this.broadcastPartyEvent({
            event: "gameInitReady",
            gameInitReady: this.gameInitReadyList
        });
    }

    broadcastGameEvent(data) {
        for (var player of this.players) {
            player.sendGameEvent(data);
        }
    }

    broadcastChatEvent(data) {
        for (var player of this.players) {
            player.sendChatEvent(data);
        }
    }

    broadcastPartyEvent(data) {
        for (var player of this.players) {
            player.sendPartyEvent(data);
        }
    }

}

module.exports = Party;