var BigTwo = require("./game-bigtwo");
const util = require('util')

var po = function (obj) {
    console.log(util.inspect(obj, { showHidden: false, depth: null }));
}

var bt = new BigTwo(false);

bt.makeDeck();

console.log(bt.playerDecks);

for (var i = 0; i < 4; i++) {
    console.log("Player " + (i + 1));
    po(bt.fc.findAll(bt.playerDecks[i]));
}