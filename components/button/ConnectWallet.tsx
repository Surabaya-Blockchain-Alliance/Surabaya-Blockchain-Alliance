import { useState, useEffect } from "react";
import { useAddress, useWallet } from "@meshsdk/react";
import { BrowserWallet } from '@meshsdk/core';

const ConnectWallet = () => {
  const { wallet, connected, disconnect, error } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(connected); 
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); 

  useEffect(() => {
    if (connected && wallet) {
      setSelectedWallet(wallet);
      logWalletAddress(wallet);
      setIsConnected(true);  
    }
  }, [connected, wallet]);

  const fetchWallets = async () => {
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      console.log("Available Wallets:", availableWallets);
      setWallets(availableWallets);
      if (availableWallets.length === 0) return;
      setShowWalletModal(true);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleWalletSelect = async (walletId: string) => {
    console.log(`Selecting wallet with ID: ${walletId}`);
    setShowWalletModal(false); 
    try {
      const enabledWallet = await BrowserWallet.enable(walletId);
      const walletAddress = await enabledWallet.getUsedAddresses();
      if (walletAddress && walletAddress.length > 0) {
        setSelectedWallet({ ...enabledWallet, address: walletAddress[0] });
        console.log(`Enabled wallet with ID: ${walletId}, Address: ${walletAddress[0]}`);
        setIsConnected(true);  
      } else {
        console.error("No addresses found for this wallet.");
      }
    } catch (error) {
      console.error("Error enabling wallet:", error);
      alert("There was an issue connecting the wallet. Please try again.");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setSelectedWallet(null); 
    setIsConnected(false); 
    setShowProfileDropdown(false); 
  };

  const logWalletAddress = (wallet: any) => {
    console.log("Connected Wallet Address:", wallet.address);
  };

  const shortenAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const handleButtonClick = () => {
    if (isConnected && selectedWallet) {
      setShowProfileDropdown(!showProfileDropdown);
      return;
    } else {
      fetchWallets();
    }
  };

  return (
    <div>
      {!isConnected && !selectedWallet ? (
        <button
          className="btn btn-primary text-white rounded-full px-6 py-2"
          onClick={handleButtonClick}
        >
          {selectedWallet && selectedWallet.address ? shortenAddress(selectedWallet.address) : "Select Wallet"}
        </button>
      ) : (
        <div className="flex items-center relative">
          <button
            className="btn btn-primary text-white rounded-full px-6 py-2"
            onClick={handleButtonClick} 
          >
            {selectedWallet ? shortenAddress(selectedWallet.address) : 'Unknown Wallet'}
          </button>

          {showProfileDropdown && isConnected && selectedWallet && (
            <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-lg p-4 mt-2">
              <h3 className="text-xl font-semibold mb-4">Connected Wallet Profile</h3>
              <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
                <p className="text-gray-700"><b>Name:</b> {selectedWallet.name}</p>
                <p className="text-gray-700"><b>Address:</b> {shortenAddress(selectedWallet.address)}</p>
                <button
                  className="btn btn-danger text-white rounded-full px-6 py-2 mt-4"
                  onClick={handleDisconnect}
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
              className="btn btn-secondary text-white rounded-full px-6 py-2 w-full mt-4"
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
