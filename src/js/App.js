// JavaScript source code
import React from 'react';
import ReactDOM from 'react-dom';
import GameModal from './components/GameModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import '../css/style.css';

/*
import ClassicPlayground from './playgrounds/ClassicPlayground'
import RoyalPlayground from './playgrounds/RoyalPlayground'
import TwentyOnePlayground from './playgrounds/TwentyOnePlayground'
*/
import GuessNumberPlayground from './playgrounds/GuessNumberPlayground'
/*
import GuessBigPlayground from './playgrounds/GuessBigPlayground'
*/

const Games = {
    /*
    "classic": ClassicPlayground,
    "royal": RoyalPlayground,
    "twentyone": TwentyOnePlayground,
    */
    "guessnum": GuessNumberPlayground,
    /*
    "guessbig": GuessBigPlayground
    */
};

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { modalShow: true, playground: false };
        this.startGame = this.startGame.bind(this);
    }

    startGame(gameName) {
        if (!Games[gameName]) {
            alert("The selected game is currently unavailable.");
            return;
        }
        var localMode = document.getElementById("local-mode-switch").checked;
        this.setState({
            modalShow: false,
            playground: React.createElement(Games[gameName], {
                localMode: localMode,
                onDisable: () => {
                    this.setState({
                        modalShow: true,
                        playground: false
                    });
                }
            })
        });
    }

    render() {
        return (
            <div>
                {this.state.playground}
                <GameModal show={this.state.modalShow} onHide={() => this.setState({ modalShow: false })} startGame={this.startGame} />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("root"));