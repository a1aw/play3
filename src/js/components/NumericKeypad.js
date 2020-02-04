import React from 'react';
import { Container, ButtonGroup, Button } from 'react-bootstrap';

export default function (props) {
    var verti = [];
    var hori;
    var numbers = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    var i;
    var j;
    var enabled;
    for (i = 0; i < numbers.length; i++) {
        hori = [];
        for (j = 0; j < numbers[i].length; j++) {
            if (props.enabled && props.enabled.length !== 0) {
                enabled = props.enabled.includes(numbers[i][j]);
            } else {
                enabled = false;
            }
            hori.push(
                <Button variant={enabled ? "outline-secondary" : "secondary"} className="py-3 touch-keypad-key touch-keypad-value" key={i + "-" + j} onClick={props.onNumberClick} disabled={!enabled}>{numbers[i][j]}</Button>
            );
        }
        verti.push(
            <ButtonGroup key={i}>
                {hori}
            </ButtonGroup>
        );
    }
    return (
        <Container fluid={true} className="touch-keypad row" style={{display: props.show ? "" : "none"}}>
            <ButtonGroup vertical={true}>
                {verti}
                <ButtonGroup>
                    <Button variant="primary" className="py-3 touch-keypad-key touch-keypad-function touch-keypad-function-done" disabled={!props.doneEnabled} onClick={props.onDoneClick}><i className="fas fa-check"></i></Button>
                    <Button variant={props.enabled && props.enabled.includes(0) ? "outline-secondary" : "secondary"} className="py-3 touch-keypad-key touch-keypad-value" onClick={props.onNumberClick} disabled={!(props.enabled && props.enabled.includes(0))}>0</Button>
                    <Button variant="warning" className="py-3 touch-keypad-key touch-keypad-function touch-keypad-function-backspace" disabled={!props.backspaceEnabled} onClick={props.onBackspaceClick}><i className="fas fa-backspace"></i></Button>
                </ButtonGroup>
            </ButtonGroup>
        </Container>
    );
}