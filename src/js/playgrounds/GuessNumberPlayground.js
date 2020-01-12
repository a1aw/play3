import React from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import Playground from '../components/Playground.js';
import NumericKeypad from '../components/NumericKeypad';
import '../../css/guessnum.css';

const DEFAULT_MAXIMUM = 100;

export default class GuessNumberPlayground extends Playground {

	constructor(props){
        super(props);
        this.maximum = DEFAULT_MAXIMUM;
        this.randCount = 0;
        this.guess = this.guess.bind(this);
    }

    getMinimumPlayers() {
        return 1;
    }

    getMaximumPlayers() {
        return 4;
    }

    enable() {
        if (this.players.length > 2) {
            this.maximum = DEFAULT_MAXIMUM * this.players.length;
        }
        this.setState({
            loading: false,
            homeScreen: true,
            gameScreen: false,
            text: 0,
            number: 0,
            numberMin: 1,
            numberMax: this.maximum,
            enabledKeys: []
        });
        this.random();
    }

    disable() {
        clearInterval(this.interval);
        document.getElementsByTagName("body")[0].classList.remove("guessnum-correct");
        clearTimeout(this.timeout);
    }

    random() {
        var rand = Math.floor(Math.random() * this.maximum);
        this.setState({ text: rand });
        this.randCount++;
        if (this.randCount < 50) {
            this.timeout = setTimeout(function () {
                this.random();
            }.bind(this), 25);
        } else {
            if (this.state.homeScreen) {
                this.randCount = 0;
                this.timeout = setTimeout(function () {
                    this.random();
                }.bind(this), Math.floor(Math.random() * 5000));
            } else {
                this.randCount = 0;
                rand = Math.floor(Math.random() * this.maximum);
                this.setState({ text: "?", number: rand });
                this.readyNextTurn();
            }
        }
    }

    nextTurn() {
        if (!this.state.keypad) {
            document.getElementById("guess-number-field").disabled = false;
            document.getElementById("guess-number-field").focus();
        }
        this.setState({ enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
        this.updateKeypad();
    }

    updateKeypad() {
        return;
        /*
        var val = document.getElementById("guess-number-field").value;
        var parsedVal = parseInt(val);
        if (isNaN(parsedVal)) {
            this.setState({ enabledKeys: [] });
            return;
        }

        var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        var out = [];
        var num;
        var i;
        var j;
        var minLog = Math.floor(Math.log10(this.state.numberMin));
        var maxLog = Math.floor(Math.log10(this.state.numberMax));
        for (i = 0; i < keys.length; i++) {
            if (this.isKeyAvailable(parsedVal, keys[i], val.length)) {
                out.push(keys[i]);
            }
        }
        this.setState({ enabledKeys: out });
        */
    }

    isKeyAvailable(val, key, len = 0) {
        if (key === 0 && len === 0) {
            return false;
        }
        var minLog = Math.floor(Math.log10(this.state.numberMin));
        var maxLog = Math.floor(Math.log10(this.state.numberMax));
        console.log("key: " + key + " len: " + len);
        console.log("minLog: " + minLog + " maxLog: " + maxLog);
        console.log("numMin/pow: " + Math.floor(this.state.numberMin / Math.pow(10, len)));
        console.log("powMinloglen: " + Math.pow(key, minLog - len));
        console.log("numMax/pow: " + Math.floor(this.state.numberMax / Math.pow(10, len)));
        console.log("powMaxloglen: " + Math.pow(key, maxLog - len));
        if (Math.floor(this.state.numberMin / Math.pow(10, len)) < Math.pow(key, minLog - len)) {
            console.log("Minlog success");
            if (minLog - len > 0) {
                console.log("Not len 0")
                return this.isKeyAvailable(key, len + 1);
            } else {
                console.log("Done true")
                return true;
            }
        } else if (Math.floor(this.state.numberMax / Math.pow(10, len)) > Math.pow(key, maxLog - len)) {
            console.log("Maxlog success");
            if (maxLog - len > 0) {
                console.log("Not len 0")
                return this.isKeyAvailable(key, len + 1);
            } else {
                console.log("Done true")
                return true;
            }
        } else {
            console.log("Not correct")
            return false;
        }
    }

    startGame() {
        clearTimeout(this.timeout);
        this.setState({
            homeScreen: false,
            gameScreen: true,
            playerName: false,
            numberMin: 1,
            numberMax: this.maximum
        });
        this.resetTurns();
        this.random();
    };

    countUpDownTo(to) {
        var from = this.state.text;
        var i;
        if (to > from) {
            this.setState({ text: from + 1 });
            this.timeout = setTimeout(function () {
                this.countUpDownTo(to);
            }.bind(this), 750 / (to - from));
        } else if (to < from) {
            this.setState({ text: from - 1 });
            this.timeout = setTimeout(function () {
                this.countUpDownTo(to);
            }.bind(this), 750 / (from - to));
        } else if (to === this.state.number) {
            this.setState({ gameScreen: false, resultScreen: true });
            this.interval = setInterval(function () {
                var cl = document.getElementsByTagName("body")[0].classList;
                if (cl.contains("guessnum-correct")) {
                    cl.remove("guessnum-correct");
                } else {
                    cl.add("guessnum-correct");
                }
            }, 1000);
            return;
        } else {
            this.readyNextTurn();
        }
    }

    guess() {
        this.setState({ enabledKeys: [] });
        var guessStr = document.getElementById("guess-number-field").value;
        if (guessStr === "") {
            this.setState({ enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
            this.setState({ error: "It cannot be blank." })
            return;
        }
        var guess = parseInt(guessStr);
        if (isNaN(guess)) {
            this.setState({ enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
            this.setState({ error: "It must be an integer." })
            return;
        }

        if (guess >= this.state.numberMax) {
            this.setState({ error: "It cannot be larger than the maximum value." })
            this.setState({ enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
            return;
        } else if (guess <= this.state.numberMin) {
            this.setState({ error: "It cannot be less than the minimum value." })
            this.setState({ enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
            return;
        }

        this.setState({ error: "" });

        if (guess > this.state.number) {
            this.setState({ numberMax: guess });
        } else {
            this.setState({ numberMin: guess });
        }

        if (this.state.text === "?") {
            this.setState({ text: guess });
            document.getElementById("guess-number-field").value = "";
            if (!this.state.keypad) {
                document.getElementById("guess-number-field").focus();
            }
            this.readyNextTurn();
            return;
        } else {
            if (!this.state.keypad) {
                document.getElementById("guess-number-field").disabled = true;
            }
            this.countUpDownTo(guess);
        }

        document.getElementById("guess-number-field").value = "";
    }

    renderPlayground() {
        return (
            <div>
                {
                    this.state.homeScreen &&
                    <div className="d-flex flex-column align-items-center justify-content-center guessnum-home-screen">
                        <p className="display-2">{this.state.text}</p>
                        <p className="display-4">Guess The Number</p>
                        <br />
                        <div className="d-flex">
                            <Button variant="success" onClick={() => {
                                this.ready();
                            }}>Ready</Button>
                            <Button variant="secondary" className="ml-3">Instructions</Button>
                            <Button variant="danger" className="ml-3" onClick={() => {
                                this.leave();
                            }}>Leave</Button>
                        </div>
                    </div>
                }
                {
                    this.state.gameScreen &&
                    <div className="d-flex flex-column align-items-center justify-content-center guessnum-home-screen">
                        <p className="display-2">{this.state.text}</p>
                        <p className="display-4">{this.state.numberMin} - {this.state.numberMax}</p>
                        <br />
                        <InputGroup className="ml-8 mr-8">
                            <FormControl
                                id="guess-number-field"
                                type="number"
                                placeholder="Your Guess"
                                aria-label="Your Guess"
                                onKeyPress={(evt) => {
                                    if (evt.key === "Enter") {
                                        this.guess();
                                    }
                                }}
                                disabled
                            />
                            <InputGroup.Append>
                                <Button variant="success" onClick={this.guess}>Guess</Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <br />
                        <p className="text-danger">{this.state.error}</p>
                    </div>
                }
                {
                    this.state.resultScreen &&
                    <div className="d-flex flex-column align-items-center justify-content-center guessnum-home-screen">
                        <p className="display-2">{this.state.text}</p>
                        <p className="display-4 text-success">Bingo!</p>
                        { this.state.playerName &&
                            <p>Winner: <b>{this.state.playerName}</b></p>
                        }
                        <br />
                        <div className="d-flex">
                            <Button variant="success" onClick={() => {
                                clearInterval(this.interval);
                                document.getElementsByTagName("body")[0].classList.remove("guessnum-correct");
                                this.ready();
                            }}>Ready</Button>
                            <Button variant="secondary" className="ml-3">Instructions</Button>
                            <Button variant="danger" className="ml-3" onClick={() => {
                                this.leave();
                            }}>Leave</Button>
                        </div>
                    </div>
                }
                <NumericKeypad show={this.state.gameScreen} enabled={this.state.enabledKeys} doneEnabled={true} backspaceEnabled={true} onNumberClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click num");
                    var val = evt.target.innerHTML;
                    document.getElementById("guess-number-field").value = document.getElementById("guess-number-field").value + val;
                    this.updateKeypad();
                }} onDoneClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click done");
                    this.guess();
                }} onBackspaceClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click bs");
                    document.getElementById("guess-number-field").value = document.getElementById("guess-number-field").value.slice(0, -1);
                    this.updateKeypad();
                }} />
            </div>
        );
	}

}