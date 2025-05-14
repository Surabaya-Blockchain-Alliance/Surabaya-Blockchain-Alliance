import { useState, useEffect } from "react";
import { BlockfrostProvider, MeshTxBuilder, BrowserWallet } from "@meshsdk/core";
import { FaWallet } from "react-icons/fa6";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";
import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const PlutusAlwaysSucceedScript = {
  address: "addr_test1wrp8...example",
};
const hashScript = (addr) => "examplehashvalueforplutusscript1234567890";
const CIP68_100 = (hexName) => hexName;
const mConStr0 = () => ({});
const metadataToCip68 = (meta) => meta;

const resolveScriptHash = (scriptAddress, version = "V2") => {
  const scriptHash = hashScript(scriptAddress);
  return version === "V2" ? scriptHash.slice(0, 56) : scriptHash;
};

const stringToHex = (str) =>
  [...str].map((c) => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join("");

export default function MintNFTPage() {
  const [form, setForm] = useState({ name: "", url: "", image: "", date: "" });
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px 0; }
      }
      .fade-in {
        animation: fadeIn 3s ease-out;
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const fetchWallets = async () => {
    try {
      const availableWallets = await BrowserWallet.getAvailableWallets();
      setWallets(availableWallets);
      if (availableWallets.length === 0) {
        alert("No Cardano wallets found.");
      } else {
        setShowWalletModal(true);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const walletInstance = await BrowserWallet.enable(walletId);
      const address = await walletInstance.getChangeAddress();
      if (!address || !address.startsWith("addr")) throw new Error("Invalid Cardano address");
      setWallet(walletInstance);
      setWalletAddress(address);
    } catch (error) {
      alert("Failed to connect wallet.");
    }
  };

  const handleSignMinter = async () => {
    if (!wallet || !walletAddress) {
      setStatus(" Wallet not connected.");
      return;
    }
    try {
      setLoading(true);
      setStatus("Fetching wallet data...");
      const utxos = await wallet.getUtxos();
      if (!utxos || utxos.length === 0) throw new Error(" No UTxOs found.");
      const policyId = resolveScriptHash(PlutusAlwaysSucceedScript.address, "V1");
      const tokenNameHex = stringToHex(form.name);
      const txBuilder = new MeshTxBuilder({
        fetcher: new BlockfrostProvider("<blockfrostAPI>"),
        verbose: true,
      });

      const collateral = (await wallet.getCollateral())[0];
      const changeAddress = await wallet.getChangeAddress();

      const unsignedTx = await txBuilder
        .txIn(utxos[0].input.txHash, utxos[0].input.outputIndex, utxos[0].output.amount, utxos[0].output.address)
        .mintPlutusScriptV2()
        .mint("1", policyId, CIP68_100(tokenNameHex))
        .mintingScript(PlutusAlwaysSucceedScript.address)
        .mintRedeemerValue(mConStr0([]))
        .txOut(PlutusAlwaysSucceedScript.address, [
          { unit: policyId + CIP68_100(tokenNameHex), quantity: "1" },
        ])
        .txOutInlineDatumValue(
          metadataToCip68({
            name: form.name,
            image: form.image,
            mediaType: "image/jpg",
            description: form.url,
            eventDate: form.date,
          })
        )
        .changeAddress(changeAddress)
        .selectUtxosFrom(utxos)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .complete();

      const signedTx = await wallet.signTx(unsignedTx, true);
      const txHash = await wallet.submitTx(signedTx);
      setStatus(`✅ Minted! TxHash: ${txHash}`);
    } catch (err) {
      setStatus(" Something went wrong during minting.");
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet";

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  return (
    <div className="relative min-h-screen flex flex-col text-black overflow-hidden">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          animation: "bg-scrolling-reverse 10s linear infinite",
        }}
      />

      <div className="relative z-10 flex-grow flex flex-col">
        <Navbar />

        <main className="flex-grow w-full text-center py-20 px-6 fade-in">
          <div className="max-w-4xl mx-auto space-y-6">
            <Link
              className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
              href="#"
            >
              <BsArrowLeft className="text-xs" />
              <span className={`font-semibold ${geistTeko.variable}`}>Create Your Event NFT</span>
            </Link>

            <h1 className="text-5xl font-bold leading-tight">
              <span className="text-gray-900">Mint Your</span>{" "}
              <span className="text-green-500">Event NFT</span>
            </h1>

            <p className="text-gray-700 font-medium text-lg">
              Create and mint NFTs for your events in just a few steps.
            </p>

            <div className="space-y-4 text-left">
              {["name", "url", "image", "date"].map((field) => (
                <div className="form-control" key={field}>
                  <label className="label text-black capitalize">{field.replace("url", "URL")}</label>
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
                onClick={fetchWallets}
                className="btn border border-black text-black hover:bg-black hover:text-white w-full mt-4 flex items-center justify-center gap-2"
              >
                <FaWallet />
                {walletAddress ? `Connected: ${shortenAddress(walletAddress)}` : "Connect Wallet"}
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
      </div>
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
