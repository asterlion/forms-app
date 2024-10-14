import React, {useState} from 'react';
import {Link} from "react-router-dom";
import {Container, Nav} from "react-bootstrap";
import menu from '../img/menu.svg'

function Side(props) {

    return (
        <>

            <h1>SideBar</h1>

            <Nav defaultActiveKey="/home" className="flex-column">

                <Nav.Link href="/home">Active</Nav.Link>
                <Nav.Link eventKey="link-1">Link</Nav.Link>
                <Nav.Link eventKey="link-2">Link</Nav.Link>
                <Nav.Link eventKey="disabled" disabled>
                    Disabled
                </Nav.Link>
            </Nav>
        </>
    );
}

export default Side;