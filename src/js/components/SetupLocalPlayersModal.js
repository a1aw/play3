import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form } from 'react-bootstrap';

export default function (props) {
    var [players, setPlayers] = React.useState(false);

    var items = [];
    var i;
    for (i = props.min; i <= props.max; i++) {
        items.push(<option key={i}>{i}</option>);
    }

    if (!players) {
        players = props.min;
    }

    var nameFields = [];
    for (i = 1; i <= players; i++) {
        nameFields.push(
            <InputGroup className="mb-3" key={i}>
                <InputGroup.Prepend>
                    <InputGroup.Text id={"player-number-" + i}>Player {i}</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    placeholder={"Player " + i}
                    aria-label="Nickname"
                    aria-describedby={"player-number-" + i}
                    id={"player-nick-" + i}
                />
            </InputGroup>
        );
    }
    
    return (
        <Modal show={props.show} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Setup Players</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>This game requires at least {props.min} player(s) and at maximum {props.max} player(s). Please enter the names for the players below:</p>
                <Form.Group>
                    <Form.Label>Players:</Form.Label>
                    <Form.Control as="select" id="localPlayersSelect" onChange={() => {
                        var p = document.getElementById("localPlayersSelect").value;
                        setPlayers(p);
                    }}>
                        {items}
                    </Form.Control>
                </Form.Group>
                {nameFields}
                <Button variant="success" block onClick={() => {
                    var map = [];
                    var i;
                    var val;
                    for (i = 1; i <= players; i++) {
                        val = document.getElementById("player-nick-" + i).value;
                        if (val === "") {
                            val = "Player " + i;
                        }
                        map.push(val);
                    }
                    props.onComplete(map);
                }}>Continue</Button>
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}