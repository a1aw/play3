﻿import React from 'react';
import SetupLocalPlayersModal from './SetupLocalPlayersModal';
import PassToPlayerModal from './PassToPlayerModal';
import SelectKeypadKeyboardModal from './SelectKeypadKeyboardModal';
import { Spinner } from 'react-bootstrap';
import io from 'socket.io-client';

export default class Playground extends React.Component {

    constructor(props, gameId) {
        super(props);
        this.gameId = gameId;
        this.state = { turnPlayer: false, loading: true, loadingMsg: "Loading playground", keypad: true };
        this.props.client.on("party", this.partyEventListener = (data) => {
            if (data.event === "startGame") {
                this.startGame();
            } else if (data.event === "nextTurn") {
                this.setState({
                    turnPlayer: data.player
                });
                if (data.player.id === this.props.client.player.id) {
                    this.myTurn();
                }
            }
        });
        this.props.client.on("game", this.gameEventListener = (data) => {
            this.response(data);
        });
    }

    bootDone() {
        this.props.onBootDone();
    }

    request(req) {
        this.props.client.gameRequest(req);
    }

    response(resp) {
        this.onResponse(resp);
    }

    onResponse(resp) {
        console.warn("No response handler handling responses from server.");
        console.warn(resp);
    }

    unregisterEventListener() {
        this.props.client.off("game", this.gameEventListener);
        this.props.client.off("party", this.partyEventListener);
    }

    componentDidMount() {
        //this.setState({ selectKeypadKeyboard: true });
        this.enable();
    }

    componentWillUnmount() {
        this.disable();
        this.unregisterEventListener();
    }

    isSetupComplete() {
        return true;
    }

    setupLocalPlayers(min, max) {
        this.setState({
            loadingMsg: "Setting up local players",
            minPlayers: min,
            maxPlayers: max,
            setupLocalPlayers: true
        });
    }

    getTurnPlayer() {
        return this.state.turnPlayer;
    }

    isMyTurn() {
        return this.state.turnPlayer && this.props.client.player.id === this.state.turnPlayer.id;
    }

    myTurn() {

    }

    startGame() {

    }

    leave() {
        this.disable();
        this.props.onDisable();
        alert("TODO: Leave");
        window.location.reload();
        //TODO Submit leave status
    }

    endGame() {
        this.disable();
        this.props.onDisable();
    }

    enable() {

    }

    disable() {

    }

    renderPlayground() {

    }

    render() {
        var partyPlayers = this.props.party.players;
        var playersList = [];
        var i;
        for (i = 0; i < partyPlayers.length; i++) {
            playersList.push(<div key={partyPlayers[i].id}><span className={this.props.client.player.id === partyPlayers[i].id ? "font-weight-bold" : ""}>{(this.state.turnPlayer && this.state.turnPlayer.id === partyPlayers[i].id) ? "➡️ " : ""}{partyPlayers[i].name}</span><br /></div>);
        }
        return (
            <div className="container-fluid playground">
                {this.state.loading &&
                    <div className="loading d-flex align-items-center justify-content-center">
                    <center><Spinner animation="border" /><br /><span>{this.state.loadingMsg}</span></center>
                    </div>
                }
                {this.isSetupComplete() && this.renderPlayground()}
                {this.state.selectKeypadKeyboard &&
                    <SelectKeypadKeyboardModal show={true} />
                }
                {this.state.setupLocalPlayers &&
                    <SetupLocalPlayersModal min={this.state.minPlayers} max={this.state.maxPlayers} show={this.state.setupLocalPlayers} onComplete={
                    (map) => {
                        console.log(map);
                        this.players = map;
                        this.setState({
                            setupLocalPlayers: false,
                            loadingMsg: "Loading playground"
                        });
                        this.enable();
                    }} />
                }
                {this.state.waitPlayer &&
                    <PassToPlayerModal show={this.state.waitPlayer} playerName={this.state.playerName} onContinue={(() => {
                        this.setState({ waitPlayer: false });
                        this.nextTurn();
                    }).bind(this)} />
                }
                {playersList &&
                    <div className="party-list">
                        <h4>Party</h4>
                        {playersList}
                    </div>
                }
            </div>
        );
    }
};