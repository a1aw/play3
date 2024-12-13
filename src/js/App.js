// JavaScript source code
import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import GameModal from './components/GameModal';
import PartyModal from './components/PartyModal'
import JoinNicknameModal from './components/JoinNicknameModal';
import JoiningPartyModal from './components/JoiningPartyModal';
import ConnectingModal from './components/ConnectingModal';
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

        var endPoint = "https://play3-srv.anth.cloud";

        var savedEndPoint = localStorage.getItem("endpoint");
        if (localStorage && savedEndPoint) {
            endPoint = savedEndPoint;
            /*
            if (confirm("Warning: Your game API endpoint will be pointed to \"" + savedEndPoint + "\". Modify your LocalStorage or clear browser history to point back to default server. Are you sure to continue with this API endpoint?")) {

            };
            */
        }

        this.client = new Client(endPoint);
        this.state = {
            connectingModalShow: true,
            gameModalShow: false,
            partyModalShow: false,
            playground: false,
            gameInitReadyList: false,
            playerReadyList: false
        };
        this.startGame = this.startGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.onJoinNicknameClicked = this.onJoinNicknameClicked.bind(this);
        this.onSendMsg = this.onSendMsg.bind(this);
        this.listen();
    }

    onJoinNicknameClicked() {
        var nickName = document.getElementById("join-nickname-field").value;
        this.client.joinParty(nickName, this.state.joinPartyId);
        this.setState({
            joinNicknameModalShow: false,
            joiningPartyModalShow: true,
            creatingParty: false
        });
    }

    listen() {
        this.client.on("__ready", () => {
            this.setState({
                connectingModalShow: false
            });
            if (window.location.search && window.location.search.length === 7) {
                var partyId = window.location.search.substring(1, 7);

                this.setState({
                    joinNicknameModalShow: true,
                    joinPartyId: partyId
                });
            } else {
                this.setState({
                    gameModalShow: true,
                    connectingModalShow: false
                });
            }
        });
        this.client.on("party", (data) => {
            this.setState({
                party: this.client.party
            });

            if (data.event === "gameInitReady") {
                this.setState({
                    gameInitReadyList: this.client.gameInitReadyList
                });
            } else if (data.event === "playerReady") {
                this.setState({
                    playerReadyList: this.client.playerReadyList
                });
            } else if (data.event === "startGame") {
                this.setState({
                    gameModalShow: false,
                    partyModalShow: false
                });
            } else if (this.client.party && this.client.party.gameId && (data.event === "partyJoined" || data.event === "gameChanged")) {
                if (this.state.playground) {
                    this.setState({
                        awaitChangeGame: true
                    });
                } else {
                    this.setState({
                        joiningPartyModalShow: false,
                        partyModalShow: true
                    });
                    this.updatePlayground();
                }
            } else if (data.event && data.event.endsWith("Failed")) {
                console.error(data);
                if (data.code === -4) {
                    return;
                }
                alert("Code: " + data.code + "\nError: " + data.msg);
            }
        });
        this.client.on("chat", (data) => {
            if (!this.state.partyModalShow) {
                return;
            }

            console.log("App Chat");
            console.log(data);

            if (data.event === "chat") {
                var chatList = document.getElementById("party-modal-chat");
                var el = document.createElement("p");
                el.innerHTML = "<b>" + data.player.name + ":</b> " + data.msg;
                el.classList.add("chat-message");
                chatList.prepend(el);
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
            gameModalShow: false,
            joiningPartyModalShow: true,
            creatingParty: false
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
            gameModalShow: false,
            joiningPartyModalShow: true,
            creatingParty: true
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

    onSendMsg() {
        var msg = document.getElementById("your-message-field").value;
        if (!msg || msg === "") {
            return;
        }
        document.getElementById("your-message-field").value = "";
        this.client.sendMessage(msg);
    }

    render() {
        return (
            <div>
                {this.state.playground}
                <ConnectingModal show={this.state.connectingModalShow} />
                <GameModal show={this.state.gameModalShow} onHide={() => this.setState({ gameModalShow: false })} startGame={this.startGame} joinGame={this.joinGame} />
                {this.state.joiningPartyModalShow &&
                    <JoiningPartyModal show={this.state.joiningPartyModalShow} create={this.state.creatingParty} partyId={this.state.joinPartyId} />
                }
                {this.state.joinNicknameModalShow &&
                    <JoinNicknameModal show={this.state.joinNicknameModalShow} partyId={this.state.joinPartyId} onJoin={this.onJoinNicknameClicked} />
                }
                {
                    this.state.partyModalShow &&
                    <PartyModal show={this.state.partyModalShow} onHide={() => this.setState({ partyModalShow: false })} client={this.client} playerReadyList={this.state.playerReadyList} gameInitReadyList={this.state.gameInitReadyList} party={this.state.party} player={this.client.player} playgroundBootDone={this.state.playgroundBootDone} onSendMsg={this.onSendMsg} />
                }
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
