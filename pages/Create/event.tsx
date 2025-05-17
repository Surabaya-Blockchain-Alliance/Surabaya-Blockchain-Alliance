import { useState, useEffect } from "react";
import {
  BlockfrostProvider,
  BrowserWallet,
  Transaction,
  ForgeScript,
} from "@meshsdk/core";

import { FaWallet } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";
import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

// Font
const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const PlutusScriptHash = "c2f5afd32a18d03601f7adf6a4a01966d8919e94249f936290048870";
const policyId = "d3286808dd73d02a43368aabeba0e09690788b88f6147f61bc7c095d";
const blockfrostKey = process.env.BLOCKFROST_KEY;

// Font helper
const stringToHex = (str) =>
  [...str].map((c) => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join("");

export default function MintNFTPage() {
  const [form, setForm] = useState({
    name: "",
    url: "",
    image: "",
    date: "",
    description: "",
    tags: "",
  });
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      setWallets(availableWallets);
      if (availableWallets.length === 0) {
        alert("No Cardano wallets found.");
      } else {
        setShowWalletModal(true);
      }
    };
    fetchWallets();
  }, []);

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    const selectedWallet = await BrowserWallet.enable(walletId);
    const address = await selectedWallet.getChangeAddress();
    setWallet(selectedWallet);
    setWalletAddress(address);
  };

  const handleSignMinter = async () => {
    if (!wallet || !walletAddress) {
      setStatus("❌ Wallet not connected.");
      return;
    }
  
    try {
      setLoading(true);
      setStatus("⏳ Preparing transaction...");
  
      const changeAddress = await wallet.getChangeAddress();
      const usedAddresses = await wallet.getUsedAddresses();
      const address = usedAddresses[0];
      const assetName = form.name || "EventNFT";
        const metadata = {
        "721": {
          [policyId]: {
            [assetName]: {
              name: form.name,
              description: form.description || "An event NFT on Cardano",
              image: form.image || "https://",
              mediaType: "image/jpeg",
              url: form.url,
              creator: address.slice(0, 64),
              createdAt: form.date || new Date().toISOString().split("T")[0],
              tags: form.tags ? form.tags.split(",") : ["event", "NFT", "cardano"],
            },
          },
        },
      };
      const tx = new Transaction({ initiator: wallet });
  
      tx.mintAsset(
        ForgeScript.withOneSignature(changeAddress),
        {
          assetName,
          assetQuantity: "1",
          metadata: metadata,
          label: "721",
          recipient: address,
        }
      );
  
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      const txLink = `https://preview.cardanoscan.io/transaction/${txHash}`;
      const shortTxHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
      setStatus(
        <>
          ✅ Event Created!{" "}
          <span className="font-mono">{shortTxHash}</span>{" "}
          <a
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Transaction
          </a>
        </>
      );
    } catch (err) {
      console.error("Minting error:", err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const bgImage: string =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';


  return (
    <div
      className="relative min-h-screen flex flex-col text-black overflow-hidden bg-white"
      style={{
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>

      <Navbar />

      <main className="flex-grow w-full text-center py-20 px-6 fade-in relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            href="#"
          >
            <BsArrowLeft className="text-xs" />
            <span className={`font-semibold ${geistTeko.variable}`}>
              Create Your Event NFT
            </span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Mint Your</span>{" "}
            <span className="text-green-500">Event NFT</span>
          </h1>

          <p className="text-gray-600 font-medium text-lg">
            Create and mint NFTs for your events in just a few steps.
          </p>

          <div className="space-y-4 text-left">
            {["name", "url", "image", "date", "description", "tags"].map((field) => (
              <div className="form-control" key={field}>
                <label className="label text-black capitalize">
                  {field.replace("url", "URL")}
                </label>
                <input
                  type={field === "date" ? "date" : "text"}
                  name={field}
                  placeholder={field === "date" ? "" : `Enter ${field}`}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>
            ))}

            <button
              onClick={() => setShowWalletModal(true)}
              className="btn border border-black text-black hover:bg-black hover:text-white w-full mt-4 flex items-center justify-center gap-2"
            >
              <FaWallet />
              {walletAddress
                ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </button>

            {walletAddress && !loading && (
              <button
                onClick={handleSignMinter}
                className="btn bg-black text-white border-none hover:bg-gray-800 w-full mt-2"
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
      </main>

      <Footer />

      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center space-y-4 max-w-md w-full">
            <h2 className="text-xl font-bold">Select a Wallet</h2>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                className="w-full py-2 border border-black text-black hover:bg-black hover:text-white rounded-md mb-2 flex items-center gap-2 justify-center"
                onClick={() => handleWalletSelect(wallet.id)}
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 rounded-sm" />
                )}
                {wallet.name}
              </button>
            ))}

            <button
              onClick={() => setShowWalletModal(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
