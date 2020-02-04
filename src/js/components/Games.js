import React from 'react';
import { Button } from 'react-bootstrap';
/*
import ClassicPlayground from '../playgrounds/ClassicPlayground'
import RoyalPlayground from '../playgrounds/RoyalPlayground'
import TwentyOnePlayground from '../playgrounds/TwentyOnePlayground'
*/
import GuessNumberPlayground from '../playgrounds/GuessNumberPlayground'
/*
import GuessBigPlayground from '../playgrounds/GuessBigPlayground'
*/

const Def = {
    /*
    "classic": {
        instance: ClassicPlayground,
        icon: "fas fa-heart",
        name: "Classic",
        minPlayers: 1,
        maxPlayers: 4
    },
    "royal": {
        instance: RoyalPlayground,
        icon: "fas fa-grin-stars",
        name: "Royal",
        minPlayers: 1,
        maxPlayers: 4
    },
    "twentyone": {
        instance: TwentyOnePlayground,
        icon: "fas fa-sort-numeric-down",
        name: "Twenty-one",
        minPlayers: 1,
        maxPlayers: 4
    },
    */
    "guessnum": {
        instance: GuessNumberPlayground,
        icon: "fas fa-list-ol",
        name: "Guess Number",
        minPlayers: 1,
        maxPlayers: 4
    }
    /*,
    "guessbig": {
        instance: GuessBigPlayground,
        icon: "fas fa-dice",
        name: "Guess Big",
        minPlayers: 1,
        maxPlayers: 4
    }
    */
};

export function isGameExist(gameId) {
    return Def[gameId] !== undefined;
}

export function getInstance(gameId) {
    return Def[gameId].instance;
}

export function getIcon(gameId) {
    return Def[gameId].icon;
}

export function getMinimumPlayers(gameId) {
    return Def[gameId].minPlayers;
}

export function getMaximumPlayers(gameId) {
    return Def[gameId].maxPlayers;
}

export function makeGameButton(gameId, disabled, onClickFunc) {
    return <Button key={gameId} variant="secondary" disabled={disabled} onClick={onClickFunc}><i className={Def[gameId].icon + " fa-2x"}></i><br />{Def[gameId].name}</Button>
}

export function listOfGameButtons(startGameFunc) {
    var out = [];
    for (var gameKey in Def) {
        out.push(
            makeGameButton(gameKey, false, () => { startGameFunc(gameKey) })
        );
    }
    return out;
}