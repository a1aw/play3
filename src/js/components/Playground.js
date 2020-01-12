import React from 'react';
import SetupLocalPlayersModal from './SetupLocalPlayersModal';
import PassToPlayerModal from './PassToPlayerModal';
import { Spinner } from 'react-bootstrap';

export default class Playground extends React.Component {

    constructor(props) {
        super(props);
        this.players = false;
        this.turns = 0;
        this.state = { loading: true, loadingMsg: "Loading playground" };
    }

    componentDidMount() {
        if (this.props.localMode) {
            this.setupLocalPlayers(this.getMinimumPlayers(), this.getMaximumPlayers());
        } else {
            this.enable();
        }
    }

    componentWillUnmount() {
        this.disable();
    }

    isSetupComplete() {
        return this.props.localMode && this.players;
    }

    setupLocalPlayers(min, max) {
        this.setState({
            loadingMsg: "Setting up local players",
            minPlayers: min,
            maxPlayers: max,
            setupLocalPlayers: true
        });
    }

    startGame() {

    }

    resetTurns() {
        this.turns = 0;
    }

    ready() {
        if (this.props.localMode) {
            this.startGame();
        }
        //TODO Submit ready status
    }

    readyNextTurn() {
        if (this.props.localMode) {
            if (this.players.length > 1) {
                var player = this.players[this.turns++ % this.players.length];
                this.setState({ waitPlayer: true, playerName: player });
            } else {
                this.nextTurn();
            }
        } else {
            //TODO online mode check
        }
    }

    leave() {
        this.disable();
        this.props.onDisable();
        //TODO Submit leave status
    }

    getMinimumPlayers() {
        return 1;
    }

    getMaximumPlayers() {
        return 1;
    }

    nextTurn() {

    }

    enable() {

    }

    disable() {

    }

    renderPlayground() {

    }

    render() {
        var playersList = false;
        if (this.players) {
            playersList = [];
            var i;
            for (i = 0; i < this.players.length; i++) {
                playersList.push(<div key={this.players[i]}><span className={this.state.playerName === this.players[i] ? "font-weight-bold" : ""}>{this.players[i]}</span><br /></div>);
            }
        }
        return (
            <div className="container-fluid playground">
                {this.state.loading &&
                    <div className="loading d-flex align-items-center justify-content-center">
                    <center><Spinner animation="border" /><br /><span>{this.state.loadingMsg}</span></center>
                    </div>
                }
                {this.isSetupComplete() && this.renderPlayground()}
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