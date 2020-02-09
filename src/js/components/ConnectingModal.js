import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import * as Games from './Games';

export default function(props) {
    return (
        <Modal show={props.show} animation={false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Play³</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-items-center align-items-center">
                    <Spinner animation="grow" role="status"></Spinner>
                    <strong className="ml-3">Connecting to server...</strong>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <p>Application licensed under the GPLv3 Public License.</p>
            </Modal.Footer>
        </Modal>
    );
}