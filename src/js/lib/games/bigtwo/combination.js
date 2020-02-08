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
        console.log("Comparing");
        console.log(this);
        console.log(combination);
        /*
        if (window) {
            window.y = combination;
            window.x = this;
        }
        */
        //Cannot compare combinations that are not the same length
        if (this.cards.length !== combination.cards.length || this.combinationName !== combination.combinationName) {
            console.log("Type nto same");
            throw new Error("The two combinations' length/types are not the same. They cannot be compared.");
            //return false;
        }

        if (this.cards.length === 5 && combination.cards.length === 5) {
            console.log("Five hands");
            var thisIndex = Sizes.FIVE_CARD_HANDS.indexOf(this.combinationName);
            var combinationIndex = Sizes.FIVE_CARD_HANDS.indexOf(combination.combinationName);

            console.log(thisIndex + " vs " + combinationIndex);

            if (thisIndex < combinationIndex) {
                return -1;
            } else if (thisIndex > combinationIndex) {
                return 1;
            }

            //Compare size if the same combination type
        }

        console.log("Compare size");

        var thisRankSize = this.getRankSize();
        var combinationRankSize = combination.getRankSize();

        if (thisRankSize < combinationRankSize) {
            console.log("Rank small")
            return -1;
        } else if (thisRankSize > combinationRankSize) {
            console.log("Rank big")
            return 1;
        }

        console.log("Compare esuit")

        var thisSuitSize = this.getSuitSize();
        var combinationSuitSize = combination.getSuitSize();

        if (thisSuitSize < combinationSuitSize) {
            console.log("suit big")
            return -1;
        } else if (thisSuitSize > combinationSuitSize) {
            console.log("suit big")
            return 1;
        }

        return 0;
    }

}

module.exports = Combination;