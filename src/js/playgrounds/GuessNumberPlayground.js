import React from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import Playground from '../components/Playground.js';
import NumericKeypad from '../components/NumericKeypad';
import '../../css/guessnum.css';

const DEFAULT_MAXIMUM = 100;

export default class GuessNumberPlayground extends Playground {

	constructor(props){
        super(props, "guessnum");
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
        this.setState({
            loading: false,
            homeScreen: false,
            gameScreen: false,
            keypadDisplay: false,
            funcKeyEnable: false,
            keypad: true,
            text: 0,
            numberMin: 1,
            numberMax: this.maximum,
            enabledKeys: [],
            numberMin: -1,
            numberMax: -1
        });
        this.bootDone();
    }

    disable() {
        clearInterval(this.interval);
        document.getElementsByTagName("body")[0].classList.remove("guessnum-correct");
        clearTimeout(this.timeout);
    }

    onResponse(resp) {
        console.log("RESPONSE");
        console.log(resp);
        if (resp.event === "numberMinMax") {
            this.setState({
                numberMin: resp.min,
                numberMax: resp.max
            });
        } else if (resp.event === "newGuess") {
            if (this.state.text === "?") {
                this.setState({
                    text: 0
                });
            }

            var state = {
                numberMin: resp.min,
                numberMax: resp.max,
                lastGuess: resp.number,
                success: resp.success
            };

            if (this.state.countDone) {
                this.setState(state);
                this.countUpDownTo(resp.number);
            } else {
                this.awaitNumbers.push(state);
            }
        }
    }

    startGame() {
        clearTimeout(this.timeout);
        this.setState({
            homeScreen: false,
            gameScreen: true,
            countDone: false
        });
        this.awaitNumbers = [];
        this.disableInput();
        this.fakeRandom();
    };

    fakeRandom() {
        var rand = Math.floor(Math.random() * this.maximum);
        this.setState({ text: rand });
        this.randCount++;
        if (this.randCount < 50 || this.state.numberMin === -1 || this.state.numberMax === -1) {
            this.timeout = setTimeout(function () {
                this.fakeRandom();
            }.bind(this), 25);
        } else {
            this.randCount = 0;
            this.setState({ text: "?", countDone: true });
            if (this.isMyTurn()) {
                this.enableInput();
            }
        }
    }

    countUpDownTo(to) {
        this.setState({ countDone: false });
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
        } else if (this.state.success) {
            this.setState({ gameScreen: false, resultScreen: true });
            this.interval = setInterval(function () {
                var cl = document.getElementsByTagName("body")[0].classList;
                if (cl.contains("guessnum-correct")) {
                    cl.remove("guessnum-correct");
                } else {
                    cl.add("guessnum-correct");
                }
            }, 1000);
            this.timeout = setTimeout(() => {
                this.endGame();
            }, 10000);
            return;
        } else if (this.awaitNumbers.length > 0) {
            var state = this.awaitNumbers.shift();
            this.setState(state);
            this.countUpDownTo(state.lastGuess);
        } else {
            this.setState({ countDone: true });
            if (this.isMyTurn()) {
                this.enableInput();
            }
        }
    }

    enableInput() {
        if (!this.state.keypad) {
            document.getElementById("guess-number-field").disabled = false;
            document.getElementById("guess-number-field").focus();
        }
        document.getElementById("guess-btn").disabled = false;
        this.setState({ keypadDisplay: this.state.keypad, funcKeyEnable: true, enabledKeys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] });
        //this.updateKeypad();
    }

    disableInput() {
        document.getElementById("guess-number-field").disabled = true;
        document.getElementById("guess-btn").disabled = true;
        this.setState({ keypadDisplay: false, funcKeyEnable: false, enabledKeys: [] });
    }

    myTurn() {
        if (this.state.countDone) {
            this.enableInput();
        }
    }

    guess() {
        this.disableInput();
        var guessStr = document.getElementById("guess-number-field").value;
        if (guessStr === "") {
            this.enableInput();
            this.setState({ error: "It cannot be blank." });
            document.getElementById("guess-btn").disabled = false;
            return;
        }
        var guess = parseInt(guessStr);
        if (isNaN(guess)) {
            this.enableInput();
            this.setState({ error: "It must be an integer." })
            return;
        }

        if (guess >= this.state.numberMax) {
            this.enableInput();
            this.setState({ error: "It cannot be larger than the maximum value." });
            return;
        } else if (guess <= this.state.numberMin) {
            this.enableInput();
            this.setState({ error: "It cannot be less than the minimum value." });
            return;
        }

        this.setState({ error: "" });

        this.request({
            event: "guess",
            number: guess
        });

        document.getElementById("guess-number-field").value = "";
    }

    renderPlayground() {
        return (
            <div>
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
                                <Button variant="success" id="guess-btn" onClick={this.guess}>Guess</Button>
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
                        {this.props.party.players.length > 1 &&
                            <p>Winner: <b>{this.getTurnPlayer().name}</b></p>
                        }
                        <br />
                        <p>You will be redirected back to the party dialog very soon.</p>
                    </div>
                }
                <NumericKeypad show={this.state.keypadDisplay} enabled={this.state.enabledKeys} doneEnabled={this.state.funcKeyEnable} backspaceEnabled={this.state.funcKeyEnable} onNumberClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click num");
                    var val = evt.target.innerHTML;
                    document.getElementById("guess-number-field").value = document.getElementById("guess-number-field").value + val;
                    //this.updateKeypad();
                }} onDoneClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click done");
                    this.guess();
                }} onBackspaceClick={(evt) => {
                    evt.preventDefault();
                    console.log("Click bs");
                    document.getElementById("guess-number-field").value = document.getElementById("guess-number-field").value.slice(0, -1);
                    //this.updateKeypad();
                }} />
            </div>
        );
	}

}