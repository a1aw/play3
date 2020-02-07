import io from 'socket.io-client';

export default class Client {

    constructor(endPoint) {
        this.endPoint = endPoint;
        this.player = false;
        this.party = false;
        this.token = false;
        this.gameInitReadyList = {};
        this.playerReadyList = {};
        this.listeners = {};
        this.initializeSocket();
    }

    initializeSocket() {
        this.socket = io(this.endPoint);
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

    socketEmit(event, data) {
        this.socket.emit(event, data);
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