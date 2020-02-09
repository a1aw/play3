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
                <p>You are joining party <b>{props.partyId}</b>!</p>
                <hr />
                <label>Nickname:</label>
                <InputGroup className="mb-3">
                    <FormControl
                        id="join-nickname-field"
                        placeholder="Nickname"
                        aria-label="Nickname"
                        aria-describedby="party-code-field-addon"
                    />
                </InputGroup>
                <hr />
                <Button variant="success" className="btn-block" onClick={props.onJoin}>Join</Button>
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}