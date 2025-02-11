import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { CardanoWallet } from "@meshsdk/react";
import ButtonBase from "../button/base";

const ConnectWallet = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (connected && wallet) {
      const fetchAddress = async () => {
        setLoading(true);
        const _assets = await wallet.getAssets();
        setAssets(_assets);
        setLoading(false);
        if (_assets && _assets[0] && _assets[0].address) {
          setWalletAddress(_assets[0].address);
        }
      };

      fetchAddress();
    }
  }, [connected, wallet]); 

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div>
      <CardanoWallet />
      {connected && walletAddress && (
        <>
          <div className="relative">
            <ButtonBase
              label="Account Profile"
              cn="btn btn-primary text-white rounded-full px-6 py-2 w-full flex justify-between items-center"
              onClick={toggleDropdown}
            >
              {walletAddress}
            </ButtonBase>
            {dropdownOpen && (
              <div className="absolute bg-white shadow-xl rounded-xl w-full mt-2 p-4">
                <h2 className="text-2xl font-semibold mb-2">Account Details</h2>
                <div className="mb-4">
                  <h3 className="font-medium">Wallet Address:</h3>
                  <p className="text-gray-700 break-all">{walletAddress}</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-medium">Balance:</h3>
                  <p className="text-gray-700">
                    {assets ? `${assets.length} Assets` : "Loading balance..."}
                  </p>
                </div>
                {assets && assets.length > 0 && (
                  <div>
                    <h3 className="font-medium">Assets:</h3>
                    <ul className="text-gray-700">
                      {assets.map((asset: any, index: number) => (
                        <li key={index}>{asset.assetName} - {asset.quantity}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <ButtonBase
                  label="Copy Address"
                  cn="btn btn-secondary text-white rounded-full px-6 py-2 mt-4"
                  onClick={() => navigator.clipboard.writeText(walletAddress!)}
                />
              </div>
            )}
          </div>

          <div className="my-6">
            {!assets && (
              <ButtonBase
                type="button"
                onClick={() => setAssets(null)} 
                disabled={loading}
                cn="btn btn-primary text-white rounded-full px-6 py-2"
              >
                {loading ? "Loading..." : "Get Wallet Assets"}
              </ButtonBase>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectWallet;
