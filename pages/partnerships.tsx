import { useState, useEffect } from "react";
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import { BrowserWallet } from "@meshsdk/core";
import { FaWallet } from "react-icons/fa6";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";
import Link from "next/link";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

// Set up the Teko font
const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const resolveScriptHash = (scriptAddress, version = "V2") => {
  const scriptHash = hashScript(scriptAddress); 
  if (version === "V2") {
    return scriptHash.slice(0, 56); 
  }
  return scriptHash;
};

// Helper function to convert string to Hex
const stringToHex = (str) => {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += ("0" + str.charCodeAt(i).toString(16)).slice(-2);
  }
  return hex;
};

export default function MintNFTPage() {
  const [form, setForm] = useState({
    name: "",
    url: "",
    image: "",
    date: "",
  });
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Handle wallet fetching (like Lace, Typhon, Yoroi)
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

  // Handle wallet selection
  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const walletInstance = await BrowserWallet.enable(walletId);
      const address = await walletInstance.getChangeAddress();
      if (!address || !address.startsWith('addr')) {
        throw new Error('Invalid Cardano address returned.');
      }
      setWallet(walletInstance);
      setWalletAddress(address);
      console.log('Wallet connected:', address);
    } catch (error) {
      console.error('Error enabling wallet:', error);
      alert('Failed to connect wallet.');
    }
  };

  // Minting function
  const handleSignMinter = async () => {
    if (!wallet || !walletAddress) {
      setStatus("❌ Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Fetching wallet data...");
      const usedAddress = await wallet.getUsedAddresses();
      const address = usedAddress[0];

      if (!address) {
        setStatus("❌ Address not found.");
        throw new Error("Address not found");
      }

      const userTokenMetadata = {
        name: form.name,
        image: form.image,
        mediaType: "image/jpg",
        description: form.url,
        eventDate: form.date,
      };

      // Get UTxOs (Unspent Transaction Outputs) from wallet
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length <= 0) {
        setStatus("❌ No UTxOs found in wallet.");
        throw new Error("No UTxOs found in wallet");
      }

      const policyId = resolveScriptHash(PlutusAlwaysSucceedScript.address, "V1");

      const tokenName = form.name;
      const tokenNameHex = stringToHex(tokenName); // Convert the name to hexadecimal

      const txBuilder = new MeshTxBuilder({
        fetcher: new BlockfrostProvider("previewL8sqDM3dHh10f55niIUiXELSAJm2OvJj"), // Blockfrost provider
        verbose: true,
      });

      const collateral = (await wallet.getCollateral())[0]; // Get collateral
      const changeAddress = await wallet.getChangeAddress(); // Get change address

      const unsignedTx = await txBuilder
        .txIn(utxos[0].input.txHash, utxos[0].input.outputIndex, utxos[0].output.amount, utxos[0].output.address)
        .mintPlutusScriptV2()
        .mint("1", policyId, CIP68_100(tokenNameHex)) // Mint token with CIP68 script
        .mintingScript(PlutusAlwaysSucceedScript.address) // Attach Plutus script
        .mintRedeemerValue(mConStr0([])) // Attach redeemer (optional)
        .txOut(PlutusAlwaysSucceedScript.address, [
          { unit: policyId + CIP68_100(tokenNameHex), quantity: "1" }, // Define output token
        ])
        .txOutInlineDatumValue(metadataToCip68(userTokenMetadata)) // Attach metadata (includes event date)
        .changeAddress(changeAddress) // Specify change address
        .selectUtxosFrom(utxos)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .complete();

      // Sign the transaction with the connected wallet
      const signedTx = await wallet.signTx(unsignedTx, true);

      // Submit the transaction
      const txHash = await wallet.submitTx(signedTx);

      setStatus(`✅ Minted! TxHash: ${txHash}`);
    } catch (err) {
      console.error("Minting error:", err);
      setStatus("❌ Something went wrong during minting.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to shorten the address
  const shortenAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet';

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  return (
    <div className="min-h-screen text-black relative overflow-hidden">
      <div className="relative z-20">
        <Navbar />
      </div>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "repeat", 
          backgroundSize: "auto", 
          backgroundPosition: "center",
          height: "100vh", 
          animation: "bg-scrolling-reverse 10s linear infinite", 
        }}
      />

      <div className="w-full text-center py-20 px-6 z-10 relative fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            href="#"
          >
            <BsArrowLeft className="text-xs" />
            <span className={`font-semibold ${geistTeko.variable}`}>Mint Your Event NFT</span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Mint Your</span>{" "}
            <span className="text-green-500">Event NFT</span>
          </h1>

          <p className="text-gray-700 font-medium text-lg">
            Create and mint NFTs for your events in just a few steps. Get started by connecting your wallet!
          </p>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label text-black">Event Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter event name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Event URL</label>
              <input
                type="text"
                name="url"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Image URL</label>
              <input
                type="text"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Event Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <button
              onClick={fetchWallets}
              className="btn btn-primary w-full mt-4"
            >
              {walletAddress ? `Connected: ${shortenAddress(walletAddress)}` : 'Connect Wallet'}
              <FaWallet />
            </button>

            {walletAddress && !loading && (
              <button
                className="btn btn-primary w-full mt-4"
                onClick={handleSignMinter}
              >
                Mint NFT
              </button>
            )}

            {status && (
              <div className="alert alert-info mt-2">
                <span>{status}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
