import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form } from 'react-bootstrap';

export default function (props) {
    return (
        <Modal show={props.show} backdrop="static">
            <Modal.Header>
                <Modal.Title>Pass to {props.playerName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>It is <b>{props.playerName}</b>'s turn! Pass the device and let {props.playerName} to press the "Continue" button.</p>
                <Button variant="success" block onClick={props.onContinue}>Continue</Button>
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}