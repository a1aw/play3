class Game {

    constructor(gameId, party) {
        this.gameId = gameId;
        this.party = party;
        this.turns = 0;
        this.turnPlayer = false;
    }

    resetTurns() {
        this.turns = 0;
    }

    setTurn(player) {
        this.turnPlayer = player;
        this.broadcastNextTurn(player);
        if (player.aiMode) {
            this.request(player, this.onAi(player));
        } else if (!player.online) {
            this.nextTurn();
        }
    }

    nextTurn() {
        var players = this.party.players;
        var player = players[this.turns++ % this.getMaximumPlayers()];
        this.setTurn(player);
    }

    broadcastNextTurn(player) {
        this.party.broadcastPartyEvent({
            event: "nextTurn",
            player: player.getDescriptor()
        });
    }

    request(player, req) {
        return this.onRequest(player, req);
    }

    response(player, resp) {
        player.sendGameEvent(resp);
    }

    getTurnPlayer() {
        return this.turnPlayer;
    }

    isNewPlayersAllowed() {
        return false;
    }

    isGameStarted() {
        return false;
    }

    isGameOver() {
        return false;
    }

    startGame() {

    }

    enable() {

    }

    disable() {

    }

    endGame() {
        this.party.endGame();
    }

    getMinimumPlayers() {
        return 1;
    }

    getMaximumPlayers() {
        return 1;
    }

    onRequest(player, req) {
        return {
            result: -1,
            msg: "Not implemented"
        };
    }

    onAi(player) {
        return {
            result: -1,
            msg: "No AI implementation"
        };
    }
}

module.exports = Game;