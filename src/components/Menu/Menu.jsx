import React, { useState } from 'react';
import { data } from '../../constants';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import CardanoConnect from '../CardanoConnect'; 

import './Menu.css';

const Menu = () => {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState(null);

    const connectWallet = async () => {
        if (typeof window.cardano === 'undefined') {
            alert('Please install the Nami Wallet.');
            return;
        }

        try {
            const wallet = window.cardano.nami; 
            await wallet.enable();
            const accounts = await wallet.getAccounts();
            setAddress(accounts[0].address);
            setConnected(true);
        } catch (error) {
            console.error('Wallet connection error:', error);
        }
    };

    const disconnectWallet = () => {
        setConnected(false);
        setAddress(null);
    };

    return (
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
            <Container>
                <Navbar.Brand href="#home">Cardano HUB</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mx-auto">
                        {data.Menu.map((item, index) => (
                            <Nav.Link key={index} href={item.link}>{item.text}</Nav.Link>
                        ))}
                    </Nav>
                    <Nav>
                        {!connected ? (
                            <CardanoConnect className="btn btn-outline-primary" onClick={connectWallet}>
                                Connect Nami Wallet
                            </CardanoConnect>
                        ) : (
                            <>
                                <span className="me-2">Connected: {address}</span>
                                <CardanoConnect className="btn btn-outline-danger" onClick={disconnectWallet}>
                                    Disconnect
                                </CardanoConnect>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menu;
