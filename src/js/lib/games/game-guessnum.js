var Game = require("../game");

const DEFAULT_MAXIMUM = 100;

class GuessNumberGame extends Game {

    constructor(party) {
        super("guessnum", party);
        this.maximum = DEFAULT_MAXIMUM;
    }

    isNewPlayersAllowed() {
        return false;
    }

    isGameStarted() {
        return this.gameStarted;
    }

    isGameOver() {
        return this.gameOver;
    }

    startGame() {
        if (this.party.players.length > 2) {
            this.maximum = DEFAULT_MAXIMUM * this.party.players.length;
        }

        this.numberMin = 1;
        this.numberMax = this.maximum;

        this.number = Math.floor(Math.random() * (this.maximum - 2)) + 2;
        this.broadcastNumberMinMax();
        this.nextTurn();
        this.gameStarted = true;
        this.gameOver = false;
    }

    broadcastNumberMinMax() {
        this.party.broadcastGameEvent({
            event: "numberMinMax",
            min: this.numberMin,
            max: this.numberMax
        });
    }

    broadcastGuessNumber(number, success) {
        this.party.broadcastGameEvent({
            event: "newGuess",
            number: number,
            min: this.numberMin,
            max: this.numberMax,
            success: success
        });
    }

    broadcastGameOver() {
        this.party.broadcastGameEvent({
            event: "gameOver",
            winner: turnPlayer.getDescriptor()
        });
    }

    enable() {
        this.gameOver = false;
    }

    disable() {

    }

    onRequest(player, req) {
        if (!this.gameOver && this.turnPlayer && this.turnPlayer.id === player.id) {
            if (req.event === "guess") {
                var guess = req.number;
                if (guess <= this.numberMin || guess >= this.numberMax) {
                    console.warn("Invalid input: " + guess);
                    return false;
                }

                var success = guess === this.number;

                if (guess > this.number) {
                    this.numberMax = guess;
                } else if (guess < this.number) {
                    this.numberMin = guess;
                }

                this.broadcastGuessNumber(guess, success);

                if (success) {
                    this.endGame();
                } else {
                    this.nextTurn();
                }
            }
        } else {
            console.warn("Warning: Invalid unauthorized request detected.")
        }
    }

    onAi(player) {
        var mid = Math.round((this.numberMin + this.numberMax) / 2);
        return {
            event: "guess",
            number: mid
        };
    }

}

module.exports = GuessNumberGame;