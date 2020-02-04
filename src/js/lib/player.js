class Player {

    constructor(id, name, token, client) {
        this.id = id;
        this.name = name;
        this.token = token;
        this.client = client;
        this.online = true;
        this.aiMode = false;
    }

    getDescriptor() {
        return {
            id: this.id,
            name: this.name,
            online: this.online,
            aiMode: this.aiMode
        };
    }

    sendGameEvent(data) {
        if (!this.client) {
            return;
        }
        this.client.emit("game", data);
    }

    sendChatEvent(data) {
        if (!this.client) {
            return;
        }
        this.client.emit("chat", data);
    }

    sendPartyEvent(data) {
        if (!this.client) {
            return;
        }
        this.client.emit("party", data);
    }

}

module.exports = Player;