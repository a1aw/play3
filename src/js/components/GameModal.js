import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form } from 'react-bootstrap';

export default function(props) {
    return (
        <Modal show={props.show} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Play³</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label>Join a party:</label>
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="Party Code"
                        aria-label="Party Code"
                        aria-describedby="party-code-field-addon"
                    />
                    <InputGroup.Append>
                        <Button variant="success">Join</Button>
                    </InputGroup.Append>
                </InputGroup>
                <div className="d-flex">
                    <Button variant="success" className="btn-block">Quick join</Button>
                    <Button variant="secondary" className="ml-2"><i className="fas fa-cog"></i></Button>
                </div>
                <hr />
                <p>Start a new game:</p>
                <div className="hori-scroll">
                    <Button variant="secondary" onClick={() => { props.startGame("classic") }}><i className="fas fa-heart fa-2x"></i><br />Classic</Button>
                    <Button variant="secondary" onClick={() => { props.startGame("royal") }}><i className="fas fa-grin-stars fa-2x"></i><br />Royal</Button>
                    <Button variant="secondary" onClick={() => { props.startGame("twentyone") }}><i className="fas fa-sort-numeric-down fa-2x"></i><br />Twenty-one</Button>
                    <Button variant="secondary" onClick={() => { props.startGame("guessnum") }}><i className="fas fa-list-ol fa-2x"></i><br />Guess Number</Button>
                    <Button variant="secondary" onClick={() => { props.startGame("guessbig") }}><i className="fas fa-dice fa-2x"></i><br />Guess Big</Button>
                </div>
                <Form.Check
                    type="switch"
                    id="local-mode-switch"
                    label="Start game locally"
                    checked={true}
                    disabled
                />
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}