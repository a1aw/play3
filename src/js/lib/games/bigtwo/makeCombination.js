var FindCombinations = require("./findCombinations");
var Sizes = require("./sizes");
var Combination = require("./combination");

module.exports = function (cards) {
    var fc = new FindCombinations();

    var combinationName;
    var fiveCardName = false;
    if(cards.length === 1) {
        combinationName = "single";
    } else {
        var result = fc.findAll(cards);

        console.log(result);

        var i;
        var key;
        combinationName = false;

        if (cards.length === 5) {
            var found = false;
            for (i = Sizes.FIVE_CARD_HANDS.length - 1; i >= 0; i--) {
                key = Sizes.FIVE_CARD_HANDS[i];
                if (result[key].length > 0) {
                    fiveCardName = key;
                    found = true;
                    break;
                }
            }

            if (found) {
                combinationName = "fiveCardHands";
            }
        } else if(cards.length === 3) {
            if (result["threeOfAKind"].length > 0) {
                combinationName = "threeOfAKind";
            }
        } else if(cards.length === 2) {
            if (result["pair"].length > 0) {
                combinationName = "pair";
            }
        }

        if (!combinationName) {
            return false;
        }
    }

    return new Combination(combinationName, cards, fiveCardName);
};