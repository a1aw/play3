var Card = require("./card");

class FindCombinations {

    findAll(deck) {
        var out = {
            pair: [],
            threeOfAKind: [],
            straight: [],
            flush: [],
            fullHouse: [],
            fourOfAKind: [],
            straightFlush: []
        };

        if (deck.length < 2) {
            return out;
        }

        var cards = this.deckToCards(deck);

        out.pair = this.findPair(cards);
        out.threeOfAKind = this.findThreeOfAKind(cards);
        out.straight = this.findStraight(cards);
        out.flush = this.findFlush(cards);
        out.fullHouse = this.findFullHouse(cards);
        out.fourOfAKind = this.findFourOfAKind(cards);
        out.straightFlush = this.findStraightFlush(cards);

        return out;
    }

    findPair(cards) {
        return this.byRankSame(cards, 2);
    }

    findThreeOfAKind(cards) {
        return this.byRankSame(cards, 3);
    }

    findStraight(cards) {
        return this.byRankConsecutive(cards, 5);
    }

    findFlush(cards) {
        return this.bySuitSame(cards, 5);
    }

    findFullHouse(cards) {
        return this.byRankSameWithExternal(cards, 3, (out, array, consec) => {
            var pairs = this.findPair(array);

            var comb;
            var x;
            for (x = 0; x < pairs.length; x++) {
                comb = consec.slice();
                comb = comb.concat(pairs[x]);
                out.push(comb);
            }
        });
    }

    findFourOfAKind(cards) {
        return this.byRankSameWithExternal(cards, 4, (out, array, consec) => {
            var comb;
            var x;
            for (x = 0; x < array.length; x++) {
                comb = consec.slice();
                comb.push(array[x]);
                out.push(comb);
            }
        });
    }

    byRankSameWithExternal(cards, len, externalFunc) {
        var out = [];

        var consec = this.byRankSame(cards, len);
        var array;
        var i;
        var x;
        var y;
        for (i = 0; i < consec.length; i++) {
            array = cards.slice();
            for (x = 0; x < consec[i].length; x++) {
                for (y = 0; y < array.length; y++) {
                    if (array[y].card.equals(consec[i][x].card)) {
                        array.splice(y, 1);
                        break;
                    }
                }
            }

            externalFunc(out, array, consec[i]);
        }

        return out;
    }

    findStraightFlush(cards) {
        var straights = this.findStraight(cards);

        var out = [];
        var i;
        var x;
        var count;
        for (i = 0; i < straights.length; i++) {
            count = 0;
            for (x = 1; x < straights[i].length; x++) {
                if (straights[i][x].card.suit === straights[i][x - 1].card.suit) {
                    count++;
                } else {
                    break;
                }

                if (count === 4) {
                    out.push(straights[i]);
                }
            }
        }

        return out;
    }

    byRankSame(cards, len) {
        return this.sameCombinations(cards, len, "getRankSize");
    }

    bySuitSame(cards, len) {
        return this.sameCombinations(cards, len, "getSuitSize");
    }

    sameCombinations(cards, len, sizeFuncName) {
        var out = [];

        cards.sort((a, b) => {
            var aSize = a.card[sizeFuncName]();
            var bSize = b.card[sizeFuncName]();
            if (aSize < bSize) {
                return -1;
            } else if (aSize > bSize) {
                return 1;
            } else {
                return 0;
            }
        });

        var startPos;
        var i;
        var x;
        var count;
        var comb;
        for (startPos = 0; startPos < cards.length - (len - 1); startPos++) {
            count = 0;
            for (i = startPos + 1; i < cards.length; i++) {
                if (cards[i - 1].card[sizeFuncName]() === cards[i].card[sizeFuncName]()) {
                    count++;
                } else {
                    break;
                }

                if (count === len - 1) {
                    comb = [];
                    for (x = startPos; x < startPos + len; x++) {
                        comb.push(cards[x]);
                    }
                    out.push(comb);
                    break;
                }
            }
        }

        return out;
    }

    byRankConsecutive(cards, len) {
        var out = [];

        cards.sort((a, b) => {
            var aSize = a.card.getRankSize();
            var bSize = b.card.getRankSize();
            if (aSize < bSize) {
                return -1;
            } else if (aSize > bSize) {
                return 1;
            } else {
                return 0;
            }
        });

        var startPos;
        var i;
        var x;
        var count;
        var comb;
        for (startPos = 0; startPos < cards.length - (len - 1); startPos++) {
            count = 0;
            for (i = startPos + 1; i < cards.length; i++) {
                if (cards[i - 1].card.getRankSize() === cards[i].card.getRankSize() - 1) {
                    count++;
                } else {
                    break;
                }

                if (count === len - 1) {
                    comb = [];
                    for (x = startPos; x < startPos + len; x++) {
                        comb.push(cards[x]);
                    }
                    out.push(comb);
                    break;
                }
            }
        }

        return out;
    }

    sortByRank(deck) {
        this.sortDeckSuits(deck);
        this.sortDeckRanks(deck);
    }

    sortBySuit(deck) {
        this.sortDeckRanks(deck);
        this.sortDeckSuits(deck);
    }

    sortDeckRanks(deck) {
        deck.sort((a, b) => {
            var aSize = a.getRankSize();
            var bSize = b.getRankSize();
            if (aSize < bSize) {
                return -1;
            } else if (aSize > bSize) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    sortDeckSuits(deck) {
        deck.sort((a, b) => {
            var aSize = a.getSuitSize();
            var bSize = b.getSuitSize();
            if (aSize < bSize) {
                return -1;
            } else if (aSize > bSize) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    deckToCards(deck) {
        var cards = [];
        var i;
        for (i = 0; i < deck.length; i++) {
            cards.push({
                index: i,
                card: deck[i]
            });
        }
        return cards;
    }

    cardsToDeck(cards) {
        var deck = [];
        var i;
        for (i = 0; i < cards.length; i++) {
            deck.push(cards[i].card);
        }
        return deck;
    }
    
    jsonToCards(deck) {
        var out = [];
        var i;
        for (i = 0; i < deck.length; i++) {
            out.push(new Card(deck[i].suit, deck[i].rank))
        }
        return out;
    }
}

module.exports = FindCombinations;