import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { auth, provider, signInWithPopup } from '../../config';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { BrowserWallet } from '@meshsdk/core';
import { FaWallet } from 'react-icons/fa6';
import { signInWithCustomToken } from 'firebase/auth';


const WalletLogin = ({ onConnect, onVerified }) => {
  const { wallet, connected, disconnect } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [isConnected, setIsConnected] = useState(connected);
  const [loading, setLoading] = useState(false);

  const getWalletAddress = async (walletInstance) => {
    try {
      const usedAddresses = await walletInstance.getUsedAddresses();
      return usedAddresses.length > 0 ? usedAddresses[0] : await walletInstance.getChangeAddress();
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  };

  useEffect(() => {
    if (connected && wallet) {
      (async () => {
        const address = await getWalletAddress(wallet);
        if (address) {
          setSelectedWallet({ ...wallet, address });
          setIsConnected(true);
          console.log('Wallet connected (Mesh SDK):', address);
        }
      })();
    }
  }, [connected, wallet]);

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

      if (!address || !address.startsWith('addr')) {
        throw new Error('Invalid Cardano address returned.');
      }

      setSelectedWallet({ ...walletInstance, address });
      setIsConnected(true);
      console.log(`Wallet connected: ${walletId}`, address);
      await handleSignAndAuthenticate(walletInstance, address);
    } catch (error) {
      console.error('Error enabling wallet:', error);
      alert('Failed to connect wallet.');
    }
  };

  const fetchNonce = async (walletAddress) => {
    try {
      const res = await fetch(`/api/walletAuth?walletAddress=${walletAddress}`);
      const data = await res.json();
      console.log('Fetched nonce:', data.nonce);
      return data.nonce;
    } catch (error) {
      console.error("Error fetching nonce:", error);
      alert("Failed to fetch nonce.");
      return null;
    }
  };

  const handleSignAndAuthenticate = async (walletInstance, walletAddress) => {
    try {
      setLoading(true);
      const nonce = await fetchNonce(walletAddress);
      if (!nonce) return;
  
      const { key, signature } = await walletInstance.signData(nonce, walletAddress);
      const response = await fetch('/api/walletAuth/signinVerify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, walletAddress, signature, key }),
      });
  
      if (!response.ok) {
        throw new Error('Signature verification failed.');
      }
  
      const data = await response.json();
      const firebaseToken = data.token;
  
      const result = await signInWithCustomToken(auth, firebaseToken);
      const user = result.user;
  
      if (!user) {
        throw new Error('Firebase sign-in with wallet failed.');
      }
  
      // ✅ Store UID and redirect
      localStorage.setItem('uid', user.uid);
  
      // 🧠 Now check if user exists in Firestore to redirect accordingly
      const userRef = doc(getFirestore(), 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        window.location.href = '/profile';
      } else {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/setup';
      }
  
      onVerified(walletAddress);
      onConnect?.(walletAddress);
      console.log('Wallet verified and Firebase signed in:', walletAddress);
    } catch (error) {
      console.error('Wallet auth failed:', error);
      alert('Wallet authentication failed. Try again.');
    } finally {
      setLoading(false);
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

  const shortenAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet';

  return (
    <div>
      <button
        className="btn w-full bg-white border-white shadow-xl text-black space-x-2 flex justify-between hover:text-white hover:bg-black hover:border-black"
        onClick={handleButtonClick}
        disabled={loading}
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
   
   </div> ); };
export default WalletLogin;