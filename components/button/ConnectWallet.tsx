import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';
import { FaWallet } from 'react-icons/fa6';

const ConnectWallet = ({ onConnect }) => {
  const { wallet, connected, disconnect } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [isConnected, setIsConnected] = useState(connected);

  useEffect(() => {
    if (connected && wallet) {
      const fetchAddress = async () => {
        try {
          const walletAddresses = await wallet.getUsedAddresses();
          const address = walletAddresses && walletAddresses.length > 0 ? walletAddresses[0] : null;
          if (address) {
            setSelectedWallet({ ...wallet, address });
            setIsConnected(true);
            if (onConnect) {
              onConnect(address); // Pass address to ProfileSetup
            }
            console.log('Wallet connected in useEffect:', address);
          }
        } catch (error) {
          console.error('Error fetching wallet address:', error);
        }
      };
      fetchAddress();
    }
  }, [connected, wallet, onConnect]);

  const fetchWallets = async () => {
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      console.log('Available Wallets:', availableWallets);
      setWallets(availableWallets);
      if (availableWallets.length > 0) {
        setShowWalletModal(true);
      } else {
        alert('No wallets available. Please install a Cardano wallet extension.');
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const enabledWallet = await BrowserWallet.enable(walletId);
      const walletAddresses = await enabledWallet.getUsedAddresses();
      const address = walletAddresses && walletAddresses.length > 0 ? walletAddresses[0] : null;
      if (address) {
        setSelectedWallet({ ...enabledWallet, address });
        setIsConnected(true);
        if (onConnect) {
          onConnect(address); // Pass address to ProfileSetup
        }
        console.log(`Enabled wallet with ID: ${walletId}, Address: ${address}`);
      } else {
        console.error('No addresses found for this wallet.');
        alert('No address found for the selected wallet.');
      }
    } catch (error) {
      console.error('Error enabling wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedWallet(null);
    setIsConnected(false);
    console.log('Wallet disconnected');
  };

  const shortenAddress = (address) => {
    if (!address) return 'Connect Wallet';
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const handleButtonClick = () => {
    if (isConnected && selectedWallet) {
      handleDisconnect();
    } else {
      fetchWallets();
    }
  };

  return (
    <div>
      <button
        className="btn w-full bg-white border-white shadow-xl text-black space-x-2 flex justify-between hover:text-white hover:bg-black hover:border-black"

        onClick={handleButtonClick}
      >
        <span>
          {isConnected && selectedWallet && selectedWallet.address
            ? `Connected: ${shortenAddress(selectedWallet.address)}`
            : 'Connect Wallet'}
        </span>
        <FaWallet />
      </button>

      {showWalletModal && !isConnected && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h3 className="text-xl font-semibold mb-4">Available Wallets</h3>
            <div className="grid grid-cols-1 gap-4">
              {wallets.length > 0 ? (
                wallets.map((availableWallet, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 shadow-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleWalletSelect(availableWallet.id)}
                  >
                    <h4 className="text-lg font-semibold">{availableWallet.name}</h4>
                    <button className="btn btn-primary text-white rounded-full px-6 py-2 w-full mt-2">
                      Connect to {availableWallet.name}
                    </button>
                  </div>
                ))
              ) : (
                <p>No wallets available</p>
              )}
            </div>
            <button
              className="btn w-full bg-[#5865F2] border-[#5865F2] shadow-xl text-white space-x-2 flex justify-between hover:text-[#5865F2] hover:bg-white hover:border-[#5865F2]"
              onClick={() => setShowWalletModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
