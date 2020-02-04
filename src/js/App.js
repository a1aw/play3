// JavaScript source code
import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import GameModal from './components/GameModal';
import PartyModal from './components/PartyModal'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import '../css/style.css';
import * as Games from './components/Games';
import Client from './lib/client';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.client = new Client("https://0.playplayplay.ml");
        this.state = {
            gameModalShow: true,
            partyModalShow: false,
            playground: false,
            gameInitReadyList: false,
            playerReadyList: false
        };
        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.listen();
    }

    componentDidMount() {
        if (window.location.search && window.location.search.length === 7) {
            var name = prompt("Enter your nickname:");

            this.client.joinParty(name, window.location.search.substring(1, 7));

            this.setState({
                gameModalShow: false
            });
        }
    }

    listen() {
        this.client.on("party", (data) => {
            this.setState({
                party: this.client.party
            });

            if (data.event === "gameInitReady") {
                this.setState({
                    gameInitReadyList: this.client.gameInitReadyList
                });
            }

            if (data.event === "playerReady") {
                this.setState({
                    playerReadyList: this.client.playerReadyList
                });
            }

            if (data.event === "startGame") {
                this.setState({
                    gameModalShow: false,
                    partyModalShow: false
                });
            }

            if (this.client.party && this.client.party.gameId && (data.event === "partyJoined" || data.event === "gameChanged")) {
                if (this.state.playground) {
                    this.setState({
                        awaitChangeGame: true
                    });
                } else {
                    this.setState({
                        gameModalShow: false,
                        partyModalShow: true
                    });
                    this.updatePlayground();
                }
            }
        });
    }

    updatePlayground() {
        this.setState({
            playgroundBootDone: false,
            playground: React.createElement(Games.getInstance(this.client.party.gameId), {
                party: this.state.party,
                client: this.client,
                onBootDone: () => {
                    console.log("Bootdone");
                    this.setState({
                        playgroundBootDone: true
                    });
                    this.client.gameInitReady();
                },
                onDisable: () => {
                    this.setState({
                        gameModalShow: false,
                        partyModalShow: true,
                        playground: false,
                        playgroundBootDone: false
                    });

                    if (this.state.awaitChangeGame) {
                        this.setState({
                            awaitChangeGame: false
                        });
                        this.updatePlayground();
                    }
                }
            })
        })
    }

    joinGame() {
        var nickName = document.getElementById("nickname-field").value;
        var partyId = document.getElementById("party-code-field").value;

        if (!nickName || nickName === "") {
            alert("Please fill in your nickname.");
            return;
        }

        if (!partyId || partyId === "" || partyId.length !== 6) {
            alert("Party Code Invalid.");
            return;
        }

        this.client.joinParty(nickName, partyId);

        this.setState({
            gameModalShow: false
        });
    }

    startGame(gameId) {
        if (!Games.isGameExist(gameId)) {
            alert("The selected game is currently unavailable.");
            return;
        }
        var localMode = document.getElementById("local-mode-switch").checked;
        var nickName = document.getElementById("nickname-field").value;

        if (!nickName || nickName === "") {
            alert("Please fill in your nickname.");
            return;
        }

        this.client.createParty(nickName, gameId);

        this.setState({
            gameModalShow: false
        });
        /*
        this.setState({
            gameModalShow: false,
            playground: React.createElement(Games[gameName], {
                localMode: localMode,
                playerName: nickName,
                onDisable: () => {
                    this.setState({
                        gameModalShow: true,
                        partyModalShow: false,
                        playground: false
                    });
                }
            })
        });
        */
    }

    render() {
        return (
            <div>
                {this.state.playground}
                <GameModal show={this.state.gameModalShow} onHide={() => this.setState({ gameModalShow: false })} startGame={this.startGame} joinGame={this.joinGame} />
                {
                    this.state.partyModalShow &&
                    <PartyModal show={this.state.partyModalShow} onHide={() => this.setState({ partyModalShow: false })} client={this.client} playerReadyList={this.state.playerReadyList} gameInitReadyList={this.state.gameInitReadyList} party={this.state.party} player={this.client.player} playgroundBootDone={this.state.playgroundBootDone} />
                }
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));