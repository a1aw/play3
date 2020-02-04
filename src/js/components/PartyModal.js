import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form, Table, Spinner } from 'react-bootstrap';
import * as Games from './Games';

function playersFalseInList(players, list) {
    var c = 0;
    for (var player of players) {
        if (player.online && !list[player.id]) {
            c++;
        }
    }
    return c;
}

export default function (props) {
    var i;
    var id;
    var admin = props.party.admin;
    var partyPlayers = props.party.players;
    var playerList = [];
    for (i = 0; i < partyPlayers.length; i++) {
        id = partyPlayers[i]["id"];

        playerList.push(
            <tr key={id}>
                <td>{i + 1}</td>
                <td><span className={partyPlayers[i].online ? "" : "text-secondary"}>{id === admin.id ? "👑 " : ""}{partyPlayers[i]["name"]} {partyPlayers[i].aiMode ? "(AI)" : ""} {props.gameInitReadyList[id] || !partyPlayers[i].online ? (props.playerReadyList[id] ? "✔️" : "") : <Spinner animation="border" role="status" size="sm"></Spinner>}</span></td>
                <td></td>
            </tr>
        );
    }

    var gameMinPlayers = Games.getMinimumPlayers(props.party.gameId);
    var gameMaxPlayers = Games.getMaximumPlayers(props.party.gameId);

    var startBtnVariant;
    var startBtnDisabled;
    var startBtnText;
    var startBtnClickFunc;
    if (playersFalseInList(partyPlayers, props.gameInitReadyList) > 0) {
        startBtnVariant = "secondary";
        startBtnDisabled = true;
        startBtnText = "Awaiting all players to boot game";
    } else {
        if (props.playerReadyList[props.player.id]) {
            if (props.player.id === admin.id) {
                var notReady = playersFalseInList(partyPlayers, props.playerReadyList);
                if (notReady > 0) {
                    startBtnVariant = "secondary";
                    startBtnDisabled = true;
                    startBtnText = (partyPlayers.length - notReady) + "/" + partyPlayers.length + " players ready";
                } else if (partyPlayers.length < gameMinPlayers) {
                    startBtnVariant = "secondary";
                    startBtnDisabled = true;
                    startBtnText = "Not enough players";
                } else {
                    startBtnVariant = "success";
                    startBtnDisabled = false;
                    startBtnText = "Start Game";
                    startBtnClickFunc = () => {
                        props.client.startGame();
                    };
                }
            } else {
                startBtnVariant = "warning";
                startBtnDisabled = false;
                startBtnText = "Unready";
                startBtnClickFunc = () => {
                    props.client.playerUnready();
                };
            }
        } else {
            startBtnVariant = "success";
            startBtnDisabled = false;
            startBtnText = "Ready";
            startBtnClickFunc = () => {
                props.client.playerReady();
            };
        }
    }
    
    return (
        <Modal show={props.show} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Party</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex">
                    {Games.makeGameButton(props.party.gameId, !props.playgroundBootDone || props.player.id !== admin.id, () => { })}
                    <div className="container">
                        <span>Party Code:</span>
                        <h2>{props.party.partyId}</h2>
                        <InputGroup className="mb-2">
                            <FormControl
                                id="share-link"
                                value={"https://playplayplay.ml/?" + props.party.partyId}
                                readOnly
                            />
                            <InputGroup.Append>
                                <Button variant="primary" onClick={() => {
                                    var url = document.getElementById("share-link").value;
                                    if (navigator.share) {
                                        navigator.share({
                                            url: url
                                        });
                                    } else {
                                        prompt("Your browser does not support sharing. Please copy the URL below and share it to your friends.", url);
                                    }
                                }}><i className="fas fa-share-square"></i> Share</Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <p className="mb-2">{props.playgroundBootDone ? "The game requires at least " + gameMinPlayers + " player(s) and at maximum " + gameMaxPlayers + " player(s)." + (props.player.id === admin.id ? " Click on the icon to change game." : "") : "Loading..."} </p>
                        <Button variant={startBtnVariant} onClick={startBtnClickFunc} block disabled={startBtnDisabled}>{startBtnText}</Button>
                    </div>
                </div>
                <hr />
                <Table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nickname</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerList}
                    </tbody>
                </Table>
                {
                    props.player.id === admin.id &&
                    <Button variant="success" onClick={() => {
                        var playerName = prompt("AI Player Name:");
                        props.client.addAi(playerName);
                    }} block><i className="fas fa-plus"></i> Add computer (AI)</Button>
                }
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}