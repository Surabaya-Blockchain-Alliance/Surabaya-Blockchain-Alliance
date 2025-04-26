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

  const getWalletAddress = async (walletInstance) => {
    try {
      let address = null;
      const usedAddresses = await walletInstance.getUsedAddresses();
      if (usedAddresses.length > 0) {
        address = usedAddresses[0];
      } else {
        address = await walletInstance.getChangeAddress();
      }
      return address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  };

  useEffect(() => {
    if (connected && wallet) {
      const fetchAddress = async () => {
        const address = await getWalletAddress(wallet);
        if (address) {
          setSelectedWallet({ ...wallet, address });
          setIsConnected(true);
          onConnect?.(address);
          console.log('Wallet connected (Mesh SDK):', address);
        }
      };
      fetchAddress();
    }
  }, [connected, wallet, onConnect]);

  const fetchWallets = async () => {
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      setWallets(availableWallets);
      if (availableWallets.length === 0) {
        alert('No Cardano wallets found. Please install Lace, Typhon, or Yoroi.');
      } else {
        setShowWalletModal(true);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const walletInstance = await BrowserWallet.enable(walletId);
      const address = await getWalletAddress(walletInstance);
      if (address) {
        setSelectedWallet({ ...walletInstance, address });
        setIsConnected(true);
        onConnect?.(address);
        console.log(`Wallet connected: ${walletId}`, address);
      } else {
        alert('No address found. Try using a wallet with some activity.');
      }
    } catch (error) {
      console.error('Error enabling wallet:', error);
      alert('Failed to connect wallet.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedWallet(null);
    setIsConnected(false);
    console.log('Wallet disconnected');
  };

  const handleButtonClick = () => {
    if (isConnected && selectedWallet) {
      handleDisconnect();
    } else {
      fetchWallets();
    }
  };

  const shortenAddress = (address) => {
    if (!address) return 'Connect Wallet';
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  return (
    <div>
      <button
        className="btn w-full bg-white border-white shadow-xl text-black space-x-2 flex justify-between hover:text-white hover:bg-black hover:border-black"
        onClick={handleButtonClick}
      >
        <span>
          {isConnected && selectedWallet?.address
            ? `Connected: ${shortenAddress(selectedWallet.address)}`
            : 'Connect Wallet'}
        </span>
        <FaWallet />
      </button>

      {showWalletModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h3 className="text-xl font-semibold mb-4">Choose Wallet</h3>
            <div className="grid gap-4">
            {wallets.map((wallet, idx) => (
              <button
                key={idx}
                className={`btn w-full ${
                selectedWallet?.name === wallet.name
                  ? 'bg-black text-white border-black'
                  : 'btn-outline'
                 }`}
                onClick={() => handleWalletSelect(wallet.id)}
              >
                {wallet.name}
              </button>
            ))}
            </div>
            <button
              className="btn mt-4 w-full bg-gray-200 text-black"
              onClick={() => setShowWalletModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
