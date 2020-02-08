import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form } from 'react-bootstrap';
import * as Games from './Games';

export default function(props) {
    return (
        <Modal show={props.show} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Play³ ({VERSION})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label>Nickname:</label>
                <InputGroup className="mb-3">
                    <FormControl
                        id="nickname-field"
                        placeholder="Nickname"
                        aria-label="Nickname"
                        aria-describedby="party-code-field-addon"
                    />
                </InputGroup>
                <hr />
                <label>Join a party:</label>
                <InputGroup className="mb-3">
                    <FormControl
                        id="party-code-field"
                        placeholder="Party Code"
                        aria-label="Party Code"
                        aria-describedby="party-code-field-addon"
                    />
                    <InputGroup.Append>
                        <Button variant="success" onClick={props.joinGame}>Join</Button>
                    </InputGroup.Append>
                </InputGroup>
                <div className="d-flex">
                    <Button variant="success" className="btn-block">Quick join</Button>
                    <Button variant="secondary" className="ml-2"><i className="fas fa-cog"></i></Button>
                </div>
                <hr />
                <p>Start a new game:</p>
                <div className="hori-scroll">
                    {Games.listOfGameButtons(props.startGame)}
                </div>
                <Form.Check
                    type="switch"
                    id="local-mode-switch"
                    label="Start game locally"
                    checked={false}
                    disabled
                />
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}