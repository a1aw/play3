import React from 'react';
import { Modal, Button, ButtonGroup, InputGroup, FormControl, Form } from 'react-bootstrap';
import * as Games from './Games';

export default function (props) {
    return (
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Game Over</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                The winner is <b>{props.winner}</b>. You will be redirected back to the party dialog very soon.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}