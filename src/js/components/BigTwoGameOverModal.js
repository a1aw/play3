import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form, Table } from 'react-bootstrap';
import * as Games from './Games';

function getPlayerById(players, id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return players[i];
        }
    }
    return false;
}

export default function (props) {
    var i;
    var id;
    var player;
    var partyPlayers = props.party.players;
    var ranking = props.ranking;
    var rankList = [];
    for (i = 0; i < ranking.length; i++) {
        id = ranking[i]["playerId"];
        player = getPlayerById(partyPlayers, id);

        rankList.push(
            <tr key={id}>
                <td>{i + 1}</td>
                <td><span className={player.online ? "" : "text-secondary"}>{player["name"]} {player.aiMode ? "(AI)" : ""}</span></td>
                <td>{ranking[i].length}</td>
            </tr>
        );
    }

    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Game Over</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>The winner is <b>{props.winner.name}</b>. You will be redirected back to the party dialog very soon.</p>
                <hr />
                <Table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Nickname</th>
                            <th>Cards left</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankList}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}