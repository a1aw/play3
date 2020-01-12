import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function (props) {
    return (
        <Modal show={props.show} backdrop="static">
            <Modal.Header>
                <Modal.Title>Keypad or keyboard?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Please select either to use keypad or keyboard for input:</p>
                <div className="d-flex">
                    <Button block><i className="fas fa-keyboard"></i><br />Keyboard</Button>
                    <Button block><i className="fas fa-gamepad"></i><br />Keypad</Button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}