var Game = require("../game");
var Sizes = require("./bigtwo/sizes");
var Card = require("./bigtwo/card");
var Combination = require("./bigtwo/combination");
var FindCombinations = require("./bigtwo/findCombinations");
var makeCombination = require("./bigtwo/makeCombination");

const PLAYER_TIMER = 20000;

class BigTwoGame extends Game {

    constructor(party) {
        super("bigtwo", party);
        this.fc = new FindCombinations();
        this.allPlayersReadyList = {};
        this.awaitAi = [];
    }

    getMinimumPlayers() {
        return 4;
    }

    getMaximumPlayers() {
        return 4;
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
        this.gameStarted = true;
        this.lastCombination = false;

        this.makeDeck();
        var i;
        var firstCard;
        var diamondThreePlayer;
        var player;
        var id;
        for (i = 0; i < 4; i++) {
            player = this.party.players[i];
            id = player.id;
            this.sendDeck(player, this.playerDecks[id]);
            firstCard = this.playerDecks[id][0];
            if (firstCard.suit === "diamonds" && firstCard.rank === "3") {
                diamondThreePlayer = this.party.players[i];
            }
        }
        this.setTurn(diamondThreePlayer);
        this.broadcastNumberOfCards();
        this.waitAllPlayersReady();
    }

    waitAllPlayersReady() {
        this.allPlayersReadyList = {};
    }

    isAllPlayersReady() {
        var i;
        var player;
        var partyPlayers = this.party.players;
        for (i = 0; i < 4; i++) {
            player = partyPlayers[i];
            if (player.online && !this.allPlayersReadyList[player.id]) {
                return false;
            }
        }
        return true;
    }

    sendDeck(player, deck) {
        player.sendGameEvent({
            event: "newDeck",
            deck: deck
        });
    }

    updateDeck(player, cards) {
        player.sendGameEvent({
            event: "updateDeck",
            cards: cards
        });
    }

    makeDeck() {
        this.playerDecks = {};
        this.deck = []; 
        var i;
        var x;
        for (i = 0; i < Sizes.SUIT.length; i++) {
            for (x = 0; x < Sizes.RANK.length; x++) {
                this.deck.push(new Card(Sizes.SUIT[i], Sizes.RANK[x]));
            }
        }

        var currentIndex;
        var randomIndex;
        var tmp;
        for (i = 0; i < 100; i++) {
            currentIndex = this.deck.length;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                tmp = this.deck[currentIndex];
                this.deck[currentIndex] = this.deck[randomIndex];
                this.deck[randomIndex] = tmp;
            }
        }

        var playerDeck;
        var cardIndex
        for (i = 0; i < 4; i++) {
            playerDeck = [];
            for (x = 0; x < 13; x++) {
                cardIndex = Math.floor(Math.random() * this.deck.length);
                playerDeck.push(this.deck[cardIndex]);
                this.deck.splice(cardIndex, 1);
            }
            this.fc.sortByRank(playerDeck);
            this.playerDecks[this.party.players[i].id] = playerDeck;
        }
    }

    cardNextTurn() {
        var partyPlayers = this.party.players;
        var currIndex = -1;
        var i;
        for (i = 0; i < partyPlayers.length; i++) {
            if (partyPlayers[i].id === this.turnPlayer.id) {
                currIndex = i;
                break;
            }
        }

        var nextTurnPlayer = this.party.players[(currIndex + 1) % 4];
        this.setTurn(nextTurnPlayer);
    }

    enable() {
        this.gameOver = false;
    }

    disable() {
        clearTimeout(this.timeout);
        clearTimeout(this.playerTimeout);
    }

    isCardsInDeck(deck, cards) {
        var i;
        var j;
        var found;
        for (i = 0; i < cards.length; i++) {
            found = false;
            for (j = 0; j < deck.length; j++) {
                if (cards[i].equals(deck[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }

    /*
    removeCardsFromDeck(deck, cards) {

    }
    */
    
    removeCardsFromDeck(deck, cards) {
        var i;
        var j;
        var found;
        for (i = 0; i < cards.length; i++) {
            found = false;
            for (j = 0; j < deck.length; j++) {
                if (cards[i].equals(deck[j])) {
                    found = true;
                    deck.splice(j, 1);
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    }

    broadcastNumberOfCards() {
        var numberOfCards = {};
        for (var key in this.playerDecks) {
            numberOfCards[key] = this.playerDecks[key].length;
        }
        this.party.broadcastGameEvent({
            event: "numberOfCards",
            numberOfCards: numberOfCards
        });
    }

    broadcastLastCards() {
        this.party.broadcastGameEvent({
            event: "lastCards",
            player: this.lastPlayer.getDescriptor(),
            cards: this.lastCombination.cards
        });
    }

    broadcastLastPassed(player) {
        this.party.broadcastGameEvent({
            event: "lastPassed",
            player: player.getDescriptor()
        });
    }

    broadcastGameOver() {
        this.party.broadcastGameEvent({
            event: "gameOver",
            winner: this.lastPlayer.getDescriptor(),
            playerDecks: this.playerDecks
        });
    }

    broadcastGameReady() {
        clearTimeout(this.playerTimeout);
        var serverTime = Date.now();

        this.party.broadcastGameEvent({
            event: "gameReady",
            serverTime: serverTime,
            timeout: PLAYER_TIMER
        });

        this.playerTimeout = setTimeout(() => {
            this.request(this.turnPlayer, this.onAi(this.turnPlayer));
        }, PLAYER_TIMER);

        this.processAwaitAiRequests();
    }

    processAwaitAiRequests() {
        this.timeout = setTimeout(() => {
            if (this.isAllPlayersReady()) {
                this.runAwaitAiRequest();
            } else {
                this.processAwaitAiRequests();
            }
        }, 1000);
    }

    runAwaitAiRequest() {
        if (this.awaitAi.length > 0) {
            var player = this.awaitAi.shift();
            var req = this.aiLogic(player);
            this.request(player, req);
        }
    }

    onRequest(player, req) {
        if (!req) {
            return;
        }
        if (!this.gameOver) {
            if (req.event === "gameReady") {
                this.allPlayersReadyList[player.id] = true;
                if (this.isAllPlayersReady()) {
                    this.broadcastGameReady();
                }
            } else if (this.turnPlayer && this.turnPlayer.id === player.id) {
                if (!this.isAllPlayersReady()) {
                    player.sendGameEvent({
                        event: "requestFailed",
                        code: -1,
                        msg: "Players are not ready."
                    });
                    return;
                }

                clearTimeout(this.playerTimeout);
                this.waitAllPlayersReady();

                if (req.event === "turn") {
                    var cards = this.fc.jsonToCards(req.cards);

                    var turnDeck = this.fc.cardsToDeck(cards);

                    var deck = this.playerDecks[player.id];

                    if (!this.isCardsInDeck(deck, turnDeck)) {
                        player.sendGameEvent({
                            event: "turnFailed",
                            code: -1,
                            msg: "You do not have such cards in deck."
                        });
                        return;
                    }

                    var combination = makeCombination(turnDeck);

                    if (!combination) {
                        player.sendGameEvent({
                            event: "turnFailed",
                            code: -2,
                            msg: "Invalid turn cards combination."
                        });
                        return;
                    }

                    if (!this.lastCombination) {
                        var d3Found = false;
                        for (var card of turnDeck) {
                            if (card.suit === "diamonds" && card.rank === "3") {
                                d3Found = true;
                                break;
                            }
                        }

                        if (!d3Found) {
                            player.sendGameEvent({
                                event: "turnFailed",
                                code: -3,
                                msg: "The first turn cards must include a Diamond-3 card."
                            });
                            return;
                        }
                    } else if (this.lastPlayer.id !== player.id) {
                        if (combination.combinationName !== this.lastCombination.combinationName) {
                            player.sendGameEvent({
                                event: "turnFailed",
                                code: -5,
                                msg: "The card combination type has to be the same as the last combination."
                            });
                            return;
                        }

                        var compare = combination.compare(this.lastCombination);

                        if (compare <= 0) {
                            player.sendGameEvent({
                                event: "turnFailed",
                                code: -6,
                                msg: "The card combination has to be bigger than the last combination."
                            });
                            return;
                        }
                    }

                    if (!this.removeCardsFromDeck(deck, turnDeck)) {
                        player.sendGameEvent({
                            event: "turnFailed",
                            code: -7,
                            msg: "Cards removal unsuccessful."
                        });
                        return;
                    }

                    this.updateDeck(player, cards);

                    this.lastPlayer = player;
                    this.lastCombination = combination;

                    this.broadcastLastCards();
                    this.broadcastNumberOfCards();

                    player.sendGameEvent({
                        event: "turnSuccess"
                    });

                    if (deck.length === 0) {
                        this.gameOver = true;
                        this.broadcastGameOver();
                        this.endGame();
                    } else {
                        this.cardNextTurn();
                    }
                    return;
                } else if (req.event === "pass") {
                    player.sendGameEvent({
                        event: "passSuccess"
                    });
                    this.broadcastLastPassed(player);
                    this.cardNextTurn();
                }
            }
        }
    }

    aiLogic(player) {
        var deck = this.playerDecks[player.id];

        var reqCombName = false;

        if (this.lastCombination && this.lastPlayer && this.lastPlayer.id !== player.id) {
            reqCombName = this.lastCombination.combinationName;
        } else {
            //TODO game logic
            reqCombName = "single";
        }

        var avaCombs = this.fc.findAll(deck);

        if (reqCombName === "single") {
            if (!this.lastCombination || (this.lastPlayer && this.lastPlayer.id === player.id)) {
                return {
                    event: "turn",
                    cards: [{
                        index: 0,
                        card: deck[0]
                    }]
                };
            }

            var lastCard = this.lastCombination.cards[0];
            var selectedCard = false;
            var i;
            var card;
            for (i = 0; i < deck.length; i++) {
                card = deck[i];
                if (card.compare(lastCard) > 0) {
                    selectedCard = {
                        index: i,
                        card: card
                    };
                    break;
                }
            }

            if (selectedCard) {
                return {
                    event: "turn",
                    cards: [
                        selectedCard
                    ]
                };
            } else {
                return {
                    event: "pass"
                };
            }
        } else if (reqCombName === "pair" || reqCombName === "threeOfAKind") {
            var matches = avaCombs[reqCombName];

            if (matches.length === 0) {
                return {
                    event: "pass"
                };
            }

            var selectedMatch = this.findMatchLargerThanCombination(matches, this.lastCombination);

            if (selectedMatch) {
                return {
                    event: "turn",
                    cards: selectedMatch
                }
            } else {
                return {
                    event: "pass"
                };
            }
        } else {
            var startIndex = Sizes.FIVE_CARD_HANDS.indexOf(this.lastCombination.fiveCardName);
            var i;
            var selectedMatch;
            var matches;
            for (i = startIndex; i < Sizes.FIVE_CARD_HANDS.length; i++) {
                matches = avaCombs[Sizes.FIVE_CARD_HANDS[i]];

                if (matches.length === 0) {
                    return {
                        event: "pass"
                    };
                }

                selectedMatch = this.findMatchLargerThanCombination(matches, this.lastCombination);

                if (selectedMatch) {
                    return {
                        event: "turn",
                        cards: selectedMatch
                    }
                }
            }

            return {
                event: "pass"
            };
        }
    }

    findMatchLargerThanCombination(matches, combination) {
        var selectedMatch = false;
        var i;
        var comb;
        for (i = 0; i < matches.length; i++) {
            comb = makeCombination(this.fc.cardsToDeck(matches[i]));
            if (comb.compare(combination) > 0) {
                selectedMatch = matches[i];
            }
        }
        return selectedMatch;
    }

    onAi(player) {
        if (!this.isAllPlayersReady()) {
            this.awaitAi.push(player);
        } else {
            return this.aiLogic(player);
        }
    }

}

module.exports = BigTwoGame;