var Sizes = require("./sizes");

class Card {

    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    getSuitSize() {
        return Sizes.SUIT.indexOf(this.suit);
    }

    getRankSize() {
        return Sizes.RANK.indexOf(this.rank);
    }

    /*
    getSize() {
        var suitSize = this.getSuitSize();
        var rankSize = this.getRankSize();
        return (suitSize + 1) * (rankSize + 1);
    }
    */

    compare(card) {
        var myRankIndex = Sizes.RANK.indexOf(this.rank);
        var cardRankIndex = Sizes.RANK.indexOf(card.rank);

        if (myRankIndex < cardRankIndex) {
            return -1;
        } else if (myRankIndex > cardRankIndex) {
            return 1;
        }

        var mySuitIndex = Sizes.SUIT.indexOf(this.suit);
        var cardSuitIndex = Sizes.SUIT.indexOf(card.suit);

        if (mySuitIndex < cardSuitIndex) {
            return -1;
        } else if (mySuitIndex > cardSuitIndex) {
            return 1;
        }

        return 0;
    }

    equals(card) {
        return this.suit === card.suit && this.rank === card.rank;
    }

}

module.exports = Card;