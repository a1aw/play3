var Fc = require("./findCombinations");
var Card = require("./card");
const util = require('util')

var po = function (obj) {
    console.log(util.inspect(obj, { showHidden: false, depth: null }));
}

var cards = [
    new Card("spades", "4"),
    new Card("spades", "2"),
    new Card("diamonds", "4"),
    new Card("clubs", "4"),
    new Card("diamonds", "5"),
    new Card("hearts", "5"),
    new Card("hearts", "4"),
];

var x = new Fc().findAll(cards);
po(x);