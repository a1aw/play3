import React from 'react';
import Playground from '../components/Playground.js';
import FindCombinations from '../lib/games/bigtwo/findCombinations';
import Card from '../lib/games/bigtwo/card';
import Sizes from '../lib/games/bigtwo/sizes';
import makeCombination from '../lib/games/bigtwo/makeCombination';
import { Button, ButtonGroup } from 'react-bootstrap';
import '../../css/bigtwo.css';

export default class BigTwoPlayground extends Playground {

	constructor(props){
        super(props, "bigtwo");
        this.fc = new FindCombinations();
        this.onPassBtnClicked = this.onPassBtnClicked.bind(this);
        this.onSubmitBtnClicked = this.onSubmitBtnClicked.bind(this);
    }

    enable() {
        this.setState({
            loading: false
        });
        this.bootDone();
        window.addEventListener("resize", this.resizeEventListener = () => {
            this.resizeBoard();
        });
        this.resizeBoard();
        this.deck = false;
        this.spreadCardsDone = false;
    }

    disable() {
        window.removeEventListener("resize", this.resizeEventListener);
        clearTimeout(this.timeout);
    }

    resizeBoard() {
        var calc = window.innerWidth / 1600.0;
        document.getElementById("playingcards-board").style.transform = "scale(" + calc + ", " + calc + ")";
    }

    onResponse(resp) {
        console.log("Response");
        console.log(resp);
        if (resp.event === "newDeck") {
            this.deck = this.fc.jsonToCards(resp.deck);
            console.log("New deck recevied");
            this.updateAvailableCombinations();
            if (!this.spreadCardsDone) {
                this.spreadCards();
            }
        } else if (resp.event === "updateDeck") {
            this.deck = this.fc.jsonToCards(resp.deck);
            console.log("Deck update recevied");
            this.updateAvailableCombinations();
            this.updateDeck();
        } else if (resp.event === "numberOfCards") {
            this.numberOfCards = resp.numberOfCards;
            this.updateNumberOfCards();
        } else if (resp.event === "gameReady") {
            this.setState({
                displayWaitingPlayers: false
            });
            if (this.isMyTurn()) {
                this.setState({
                    displayBottomPlayerPassed: false,
                    displayTurnButtons: true
                });
            }
        } else if (resp.event === "lastCards") {
            this.setState({
                passBtnDisabled: false
            });
            this.lastPlayer = resp.player;

            this.setPassed(resp.player, false);

            var cards = this.fc.jsonToCards(resp.cards);
            this.lastCombination = makeCombination(cards);

            this.showPlayerLastCards(this.lastPlayer, cards);

            this.sendGameReady();
        } else if (resp.event === "lastPassed") {
            this.setPassed(resp.player, true);
            this.sendGameReady();
        } else if (resp.event === "gameOver") {
            var decks = resp.playerDecks;
            var loc;
            for (var key in decks) {
                this.showPlayerLastCards(this.getPlayerById(key), decks[key], true);
            }
            setTimeout(() => {
                if (confirm("Winner: " + resp.winner.name + ". Click OK to Refresh.")) {
                    window.location.reload();
                }
            }, 10000);
        }
    }

    getPlayerById(playerId) {
        for (var player of this.props.party.players) {
            if (player.id === playerId) {
                return player;
            }
        }
        return false;
    }

    setPassed(player, passed) {
        this.removePlayerLastCards(player);

        var loc = this.playerCardsMap[player.id];
        if (loc === "left-cards") {
            this.setState({
                displayLeftPlayerPassed: passed
            });
        } else if (loc === "right-cards") {
            this.setState({
                displayRightPlayerPassed: passed
            });
        } else if (loc === "top-cards") {
            this.setState({
                displayTopPlayerPassed: passed
            });
        } else if (loc === "bottom-cards") {
            this.setState({
                displayBottomPlayerPassed: passed
            });
        }
    }

    updateDeck() {
        var parent = document.getElementById("cards-container");

        this.unselectAllCards();
        var elements = document.getElementsByClassName("bottom-cards");

        console.log(elements);

        var cardIndex;
        var card;
        var halfLength = (6.25 * this.deck.length + 0.52 * (this.deck.length - 1)) * -0.5;
        var calc;
        console.log("====== checking elements ");
        var i;
        var el;

        var toRemove = [];
        for (i = 0; i < elements.length; i++) {
            console.log("INDEX: " + i);
            el = elements[i];
            cardIndex = parseInt(el.getAttribute("data-card-index"));

            console.log("Cardindex: " + cardIndex);
            console.log("decklen: " + this.deck.length);

            if (cardIndex >= this.deck.length) {
                console.log("remove");
                console.log(el.style.backgroundImage);
                el.style.backgroundImage = `url(../../img/playingcards/back.svg)`;
                toRemove.push(el);
            } else {
                card = this.deck[cardIndex];
                calc = halfLength + 6.77 * (cardIndex);

                el.style.transition = "all 0.5s";
                el.style.transform = "translate(" + calc + "em, 15.92em)";
                el.style.backgroundImage = `url(../../img/playingcards/${card.rank}_of_${card.suit}.svg)`;
            }
        }

        for (i = 0; i < toRemove.length; i++) {
            parent.removeChild(toRemove[i]);
        }
    }

    sendGameReady() {
        this.request({
            event: "gameReady"
        });
    }

    sendPass() {
        this.request({
            event: "pass"
        });
    }

    sendTurn(cards) {
        this.request({
            event: "turn",
            cards: cards
        });
    }

    startGame() {
        if (this.deck) {
            this.spreadCards();
        }
        this.setState({
            passBtnDisabled: true
        });
    };

    updateNumberOfCards() {
        var CARDS_LOCATION = ["left", "top", "right"];
        this.playerInfoMap = {};
        this.playerCardsMap = {};
        var partyPlayers = this.props.party.players;
        var myIndex = -1;
        var i;
        for (i = 0; i < partyPlayers.length; i++) {
            if (partyPlayers[i].id === this.props.client.player.id) {
                myIndex = i;
                break;
            }
        }

        var el;
        var player;
        var obj;
        var id;
        for (i = 1; i < 4; i++) {
            player = partyPlayers[(myIndex + i) % 4];
            id = "playerInfo" + i

            obj = {};
            if (i !== 3) {
                obj[id] = player.name + " (" + this.numberOfCards[player.id] + ")";
            } else {
                obj[id] = "(" + this.numberOfCards[player.id] + ") " + player.name;
            }
            this.setState(obj);

            this.playerInfoMap[player.id] = id;
            this.playerCardsMap[player.id] = CARDS_LOCATION[i - 1] + "-cards";
        }
        this.playerCardsMap[this.props.client.player.id] = "bottom-cards";
    }

    removePlayerLastCards(player) {
        var loc = this.playerCardsMap[player.id];

        var parent = document.getElementById("cards-container");

        var els = document.getElementsByClassName("shown-cards");
        for (var el of els) {
            if (el.classList.contains(loc)) {
                parent.removeChild(el);
            }
        }
    }

    showPlayerLastCards(player, lastCards, replaceExistingCards = false) {
        this.removePlayerLastCards(player);

        var parent = document.getElementById("cards-container");

        var loc = this.playerCardsMap[player.id];

        var els;

        if (loc === "left-cards") {
            els = document.getElementsByClassName("left-cards");
            var i;
            var calc;
            var card;
            for (i = 0; i < lastCards.length; i++) {
                calc = -35.42 + 3.125 * i + (replaceExistingCards ? -8.33 : 0);
                card = lastCards[i];
                els[i].classList.add("shown-cards");
                els[i].style.transition = "all 0.5s ease-in-out";
                els[i].style.transform = " translate(" + calc + "em, 0em)";
                els[i].style.backgroundImage = `url(../../img/playingcards/${card.rank}_of_${card.suit}.svg)`;
            }
        } else if (loc === "top-cards") {
            els = document.getElementsByClassName("top-cards");
            var i;
            var height = -5.705 + (replaceExistingCards ? -10.215 : 0);
            var halfLength = 3.125 * (lastCards.length + 1) * 0.5;
            var calc;
            var card;
            for (i = 0; i < lastCards.length; i++) {
                calc = -halfLength + 3.125 * i;
                card = lastCards[i];
                els[i].classList.add("shown-cards");
                els[i].style.transition = "all 0.5s ease-in-out";
                els[i].style.transform = " translate(" + calc + "em, " + height + "em)";
                els[i].style.backgroundImage = `url(../../img/playingcards/${card.rank}_of_${card.suit}.svg)`;
            }
        } else if (loc === "right-cards") {
            els = document.getElementsByClassName("right-cards");
            var i;
            var calc;
            var card;
            for (i = 0; i < lastCards.length; i++) {
                calc = 35.42 - 3.125 * i + (replaceExistingCards ? 8.33 : 0);
                card = lastCards[i];
                els[i].classList.add("shown-cards");
                els[i].style.transition = "all 0.5s ease-in-out";
                els[i].style.transform = " translate(" + calc + "em, 0em)";
                els[i].style.backgroundImage = `url(../../img/playingcards/${card.rank}_of_${card.suit}.svg)`;
            }
        }
    }

    spreadCards() {
        this.spreadCardsDone = true;
        var cards = [];
        var i;
        for (i = 0; i < 52; i++) {
            cards.push(
                <div key={i} className="playingcard" style={{ zIndex: 52 - i }} ></div>
            );
        }

        this.setState({
            cards: cards
        });
        
        this.timeout = setTimeout(() => {
            var tf;
            var elements = document.getElementsByClassName("playingcard");
            var i;
            var element;
            var c = 0;
            for (i = 1; i <= elements.length; i++) {
                element = elements[i - 1];
                if (i % 4 === 0) {
                    element.classList.add("left-cards");
                    tf = "translate(-43.75em, 0em) rotate(-180deg)";
                } else if (i % 4 === 1) {
                    element.classList.add("top-cards");
                    tf = "translate(0em, -15.92em) rotate(-180deg)";
                } else if (i % 4 === 2) {
                    element.classList.add("right-cards");
                    tf = "translate(43.75em, 0em) rotate(180deg)";
                } else {
                    element.classList.add("bottom-cards");
                    //tf = "translate(0em, 15.92em) rotate(180deg)";
                    var calc = -40.62 + 6.77 * (c);
                    tf = "translate(" + calc + "em, 15.92em)";
                    element.setAttribute("data-card-index", c);

                    element.addEventListener("mouseover", (evt) => {
                        evt.stopImmediatePropagation();
                        var el = evt.target;

                        var selected = el.getAttribute("data-card-selected");

                        if (selected === "true") {
                            return;
                        }

                        el.style.transition = "all 0.2s ease-in-out";

                        var tf = el.style.transform.split(") ")[0];

                        if (tf !== el.style.transform) {
                            tf += ")";
                        }

                        el.style.transform = tf + " translate(0em, -0.78125em)";
                    });

                    element.addEventListener("mouseout", (evt) => {
                        evt.stopImmediatePropagation();
                        var el = evt.target;

                        var selected = el.getAttribute("data-card-selected");

                        if (selected === "true") {
                            return;
                        }

                        el.style.transition = "all 0.2s ease-in-out";

                        var tf = el.style.transform.split(") ")[0];

                        if (tf !== el.style.transform) {
                            tf += ")";
                        }

                        el.style.transform = tf;
                    });

                    element.addEventListener("click", (evt) => {
                        evt.stopImmediatePropagation();

                        var el = evt.target;

                        var selected = el.getAttribute("data-card-selected");

                        if (selected === "true") {
                            this.unselectCardElement(el);
                        } else {
                            this.selectCardElement(el);
                        }
                    });

                    var card = this.deck[c];
                    element.style.backgroundImage = `url(../../img/playingcards/${card.rank}_of_${card.suit}.svg)`;
                    c++;
                }
                element.style.transition = "all 0.5s " + Math.round(0.025 * i * 100) / 100 + "s";
                element.style.transform = tf;
            }
            
            this.timeout = setTimeout(() => {
                this.setState({
                    displayNumberOfCards: true,
                    displayCombinationButtons: true,
                    displayWaitingPlayers: true
                });
                this.sendGameReady();
            }, 2000);
        }, 1000);
    }

    updateAvailableCombinations() {
        this.setState({
            availableCombinations: this.fc.findAll(this.deck)
        });
    }

    selectCardElement(el) {
        el.style.transition = "all 0.2s ease-in-out";

        var tf = el.style.transform.split(") ")[0];

        if (tf !== el.style.transform) {
            tf += ")";
        }

        el.style.transform = tf + " translate(0em, -1.5625em)";
        el.setAttribute("data-card-selected", "true");
    }

    unselectCardElement(el) {
        el.style.transition = "all 0.2s ease-in-out";

        var tf = el.style.transform.split(") ")[0];

        if (tf !== el.style.transform) {
            tf += ")";
        }

        el.style.transform = tf;
        el.setAttribute("data-card-selected", "false");
    }

    selectCombination(combName) {
        this.unselectAllCards();

        if (this.lastSelectCombinationName === combName) {
            this.lastSelectCombinationCount++;
        } else {
            this.lastSelectCombinationName = combName;
            this.lastSelectCombinationCount = 0;
        }

        var matches = this.state.availableCombinations[combName];

        if (this.lastSelectCombinationCount === matches.length) {
            this.lastSelectCombinationName = false;
            this.lastSelectCombinationCount = 0;
            this.unselectAllCards();
            return;
        }

        var match = matches[this.lastSelectCombinationCount];

        var cardEl;
        for (var matchCard of match) {
            cardEl = this.findCardElement(matchCard.index);
            if (cardEl) {
                this.selectCardElement(cardEl);
            } else {
                console.warn("Cannot find card index " + matchCard.index);
            }
        }
    }

    unselectAllCards() {
        var elements = document.getElementsByClassName("bottom-cards");
        for (var el of elements) {
            this.unselectCardElement(el);
        }
    }

    findCardElement(index) {
        var elements = document.getElementsByClassName("bottom-cards");
        var cardIndex;
        for (var el of elements) {
            cardIndex = parseInt(el.getAttribute("data-card-index"));
            if (cardIndex === index) {
                return el;
            }
        }
        return false;
    }

    onPassBtnClicked() {
        if (!this.lastPlayer || !this.lastCombination) {
            return;
        }
        this.setState({
            displayTurnButtons: false
        });
        this.sendPass();
    }

    onSubmitBtnClicked() {
        this.setState({
            displayTurnButtons: false
        });

        var cards = this.getSelectedCards();
        if (!this.lastPlayer || !this.lastCombination) {
            var d3Found = false;
            for (var card of cards) {
                if (card.suit === "diamonds" && card.rank === "3") {
                    d3Found = true;
                    break;
                }
            }

            if (!d3Found) {
                alert("First turn cards must include a Diamond-3 card.");
                this.setState({
                    displayTurnButtons: true
                });
                return;
            }
        }

        var combination = makeCombination(cards);

        if (!combination) {
            alert("Invalid combination.");
            this.setState({
                displayTurnButtons: true
            });
            return;
        }

        if (this.lastCombination && this.lastPlayer.id !== this.props.client.player.id) {
            if (this.lastCombination.combinationName !== combination.combinationName) {
                alert("Combination type is not the same the last combination type.");
                this.setState({
                    displayTurnButtons: true
                });
                return;
            }

            var compare = combination.compare(this.lastCombination);
            if (compare <= 0) {
                alert("Your combination has to be larger than the last combination.");
                this.setState({
                    displayTurnButtons: true
                });
                return;
            }
        }

        this.sendTurn(cards);
    }

    getSelectedCards() {
        var els = document.getElementsByClassName("bottom-cards");
        var out = [];
        var cardIndex;
        for (var el of els) {
            if (el.getAttribute("data-card-selected") === "true") {
                cardIndex = parseInt(el.getAttribute("data-card-index"));
                out.push(this.deck[cardIndex]);
            }
        }
        return out;
    }

    renderPlayground() {
        var results = {};
        if (this.state.availableCombinations) {
            for (var key of Sizes.FIVE_CARD_HANDS) {
                results[key] = this.state.availableCombinations[key] && this.state.availableCombinations[key].length > 0;
            }
        }

        return (
            <div className="board" id="playingcards-board">
                <div className="playingcards" id="cards-container">
                    {this.state.displayWaitingPlayers &&
                        <div className="waiting-players align-items-center justify-items-center">
                            Waiting other players...
                        </div>
                    }
                    {this.state.displayLeftPlayerPassed &&
                        <div className="left-player-passed align-items-center justify-items-center">
                            Passed
                        </div>
                    }
                    {this.state.displayTopPlayerPassed &&
                        <div className="top-player-passed align-items-center justify-items-center">
                            Passed
                        </div>
                    }
                    {this.state.displayRightPlayerPassed &&
                        <div className="right-player-passed align-items-center justify-items-center">
                            Passed
                        </div>
                    }
                    {this.state.displayBottomPlayerPassed &&
                        <div className="bottom-player-passed align-items-center justify-items-center">
                            Passed
                        </div>
                    }
                    {this.state.displayNumberOfCards &&
                        <>
                            <div className="player1">
                                <p>{this.state.playerInfo1}</p>
                            </div>
                            <div className="player2">
                                <p>{this.state.playerInfo2}</p>
                            </div>
                            <div className="player3">
                                <p>{this.state.playerInfo3}</p>
                            </div>
                        </>
                    }
                    {this.state.displayTurnButtons &&
                        <div className="turn-buttons">
                            <ButtonGroup>
                                <Button variant="primary" id="pass-btn" onClick={this.onPassBtnClicked}><i className="fas fa-forward" disabled={this.state.passBtnDisabled}></i> Pass</Button>
                                <Button variant="warning" id="hint-btn" disabled={true}><i className="far fa-lightbulb"></i> Hint</Button>
                                <Button variant="success" id="submit-btn" onClick={this.onSubmitBtnClicked}><i className="fas fa-check"></i> Submit</Button>
                            </ButtonGroup>
                        </div>
                    }
                    {this.state.displayCombinationButtons &&
                        <div className="combination-buttons">
                            <ButtonGroup>
                                <Button variant={results["straight"] ? "success" : "secondary"} id="straight-btn" disabled={!results["straight"]} onClick={() => { this.selectCombination("straight") }}>Straight</Button>
                            <Button variant={results["flush"] ? "success" : "secondary"} id="flush-btn" disabled={!results["flush"]} onClick={() => { this.selectCombination("flush") }}>Flush</Button>
                                <Button variant={results["fullHouse"] ? "success" : "secondary"} id="full-house-btn" disabled={!results["fullHouse"]} onClick={() => { this.selectCombination("fullHouse") }}>Full House</Button>
                                <Button variant={results["fourOfAKind"] ? "success" : "secondary"} id="four-of-a-kind-btn" disabled={!results["fourOfAKind"]}  onClick={() => { this.selectCombination("fourOfAKind") }}>Four Of A Kind</Button>
                                <Button variant={results["straightFlush"] ? "success" : "secondary"} id="straight-flush-btn" disabled={!results["straightFlush"]}  onClick={() => { this.selectCombination("straightFlush") }}>Straight Flush</Button>
                            </ButtonGroup>
                        </div>
                    }
                    {this.state.cards}
                </div>
            </div>
        );
	}

}