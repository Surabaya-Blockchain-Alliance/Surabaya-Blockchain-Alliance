import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Dropdown, Table, Card, Row, Col } from 'react-bootstrap';
import loadingGif from '../assets/animate1.gif'; // make sure you have this loading GIF in your assets
import { coins } from '@cosmjs/stargate'; // Assume necessary cosmos libraries are installed
import BigNumber from 'bignumber.js';

// Sample data structure for chains
const chains = [
  { id: 'cosmoshub-4', name: 'Cosmos Hub', apiUrl: 'https://cosmos-rest.publicnode.com', denom: 'uatom', variant: 'primary' },
  { id: 'osmosis-1', name: 'Osmosis', apiUrl: 'https://lcd.osmosis.zone', denom: 'uosmo', variant: 'success' },
  { id: 'akashnet-2', name: 'Akash Network', apiUrl: 'https://akash-api.polkachu.com', denom: 'uakt', variant: 'warning' },
  { id: 'planq_7070-2', name: 'Planq Network', apiUrl: 'https://rest.planq.network', denom: 'aplanq', variant: 'info' },
  { id: 'celestia', name: 'Celestia Network', apiUrl: 'https://api.lunaroasis.net', denom: 'utia', variant: 'dark' },
];

// Sample Component for Delegating Tokens
const DelegateModal = ({ show, onHide, onDelegate, validatorId, amount, setAmount }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delegate Stake</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Amount to Delegate</Form.Label>
            <Form.Control 
              type="number" 
              placeholder="Enter amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={() => onDelegate(validatorId, amount)}>Delegate</Button>
      </Modal.Footer>
    </Modal>
  );
};

const StakingPage = () => {
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [validators, setValidators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [delegationAmount, setDelegationAmount] = useState('');

  // Placeholder for fetchValidators logic
  const fetchValidators = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${selectedChain.apiUrl}/cosmos/staking/v1beta1/validators`);
      if (!response.ok) throw new Error('Failed to fetch validators');
      const data = await response.json();
      setValidators(data.validators);
    } catch (error) {
      console.error('Error fetching validators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for connectWallet logic
  const connectWallet = async () => {
    try {
      const { keplr } = window;
      if (!keplr) throw new Error('Keplr wallet not found');

      await keplr.enable(selectedChain.id);
      const offlineSigner = keplr.getOfflineSigner(selectedChain.id);
      const accounts = await offlineSigner.getAccounts();
      setWalletConnected(true);
      console.log('Wallet connected:', accounts[0].address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // UseEffect to load validators when chain changes
  useEffect(() => {
    fetchValidators();
  }, [selectedChain]);

  return (
    <div className="container mt-3">
      <Row className="mb-4">
        <Col>
          <Dropdown>
            <Dropdown.Toggle variant={selectedChain.variant}>{selectedChain.name}</Dropdown.Toggle>
            <Dropdown.Menu>
              {chains.map(chain => (
                <Dropdown.Item key={chain.id} onClick={() => setSelectedChain(chain)}>{chain.name}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col>
          <Button onClick={connectWallet}>
            {walletConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        </Col>
      </Row>
      {isLoading ? (
        <div>Loading validators...</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Validator</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {validators.map((validator, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{validator.description.moniker}</td>
                <td>
                  <Button onClick={() => {
                    setShowDelegationModal(true);
                    // Set current validator details here
                  }}>Delegate</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <DelegateModal
        show={showDelegationModal}
        onHide={() => setShowDelegationModal(false)}
        onDelegate={(validatorId, amount) => {
          console.log(`Delegated ${amount} to ${validatorId}`);
          setShowDelegationModal(false);
        }}
        validatorId={validators[0]?.operator_address}
        amount={delegationAmount}
        setAmount={setDelegationAmount}
      />
    </div>
  );
};

export default StakingPage;
