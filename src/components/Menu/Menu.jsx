import React from 'react';
import { data } from '../../constants';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
    return (
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
            <Container>
                <Navbar.Brand href="#home">Community Node</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mx-auto">
                        {data.Menu.map((item, index) => (
                            <Nav.Link key={index} href={item.link}>{item.text}</Nav.Link>
                            
                        ))}
                    </Nav>
                    <Nav>
                        <Button variant="outline-primary" href="#explorer">Explorer</Button> {/* Explorer button */}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Menu;
