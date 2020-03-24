var Sizes = require("./sizes");
var FindCombinations = require("./findCombinations");

class Combination {

    constructor(combinationName, cards, fiveCardName) {
        this.cards = cards;
        this.combinationName = combinationName;
        this.fiveCardName = fiveCardName;
    }

    getRankSize() {
        var size = 0;
        var i;
        for (i = 0; i < this.cards.length; i++) {
            size += this.cards[i].getRankSize();
        }
        return size;
    }

    getSuitSize() {
        var size = 0;
        var i;
        for (i = 0; i < this.cards.length; i++) {
            size += this.cards[i].getSuitSize();
        }
        return size;
    }

    compare(combination) {
        //Cannot compare combinations that are not the same length
        if (this.cards.length !== combination.cards.length || this.combinationName !== combination.combinationName) {
            throw new Error("The two combinations' length/types are not the same. They cannot be compared.");
            //return false;
        }
        
        if (this.combinationName === "fiveCardHands" && this.cards.length === 5) {
            var thisIndex = Sizes.FIVE_CARD_HANDS.indexOf(this.fiveCardName);
            var combinationIndex = Sizes.FIVE_CARD_HANDS.indexOf(combination.fiveCardName);

            if (thisIndex < combinationIndex) {
                return -1;
            } else if (thisIndex > combinationIndex) {
                return 1;
            }

            //Compare size if the same combination type
        }

        var thisRankSize = this.getRankSize();
        var combinationRankSize = combination.getRankSize();

        if (thisRankSize < combinationRankSize) {
            return -1;
        } else if (thisRankSize > combinationRankSize) {
            return 1;
        }

        var thisSuitSize = this.getSuitSize();
        var combinationSuitSize = combination.getSuitSize();

        if (thisSuitSize < combinationSuitSize) {
            return -1;
        } else if (thisSuitSize > combinationSuitSize) {
            return 1;
        }

        return 0;
    }

}

module.exports = Combination;