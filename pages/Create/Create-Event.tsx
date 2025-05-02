import { useState } from "react";
import { BsCheck2Circle } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function MintNFTPage() {
  const [form, setForm] = useState({
    name: "",
    url: "",
    image: "",
    date: "",
  });
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      return alert("Wallet not connected.");
    }

    try {
      setLoading(true);
      setStatus("Getting UTxO...");

      const utxoRes = await fetch(`/api/get-utxo?address=${walletAddress}`);
      const { utxo } = await utxoRes.json();

      setStatus("Minting NFT...");

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          utxoRef: utxo,
          userAddress: walletAddress,
          creatorVKHHex: walletAddress, 
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus(`✅ Minted! TxHash: ${result.txHash}`);
      } else {
        setStatus(`❌ Mint failed: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen text-gray-800">
        <div
          className="flex justify-between items-start gap-5"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url('/img/bg-tile.png') repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div className="bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10 overflow-y-auto" style={{ maxHeight: "100vh" }}>
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">Mint Event NFT</h1>
              <p className="text-sm font-medium">Enter your event details</p>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label text-black">Event Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter event name"
                  value={form.name}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Event Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <ConnectWallet
                onConnect={setWalletAddress}
                onVerified={(address) => {
                  console.log("Wallet verified:", address);
                  setWalletAddress(address);
                }}
              />

              <button
                className="btn w-full bg-black text-white hover:bg-gray-800"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Minting..." : "Mint NFT"}
                <BsCheck2Circle className="text-lg ml-2" />
              </button>

              {status && (
                <div className="alert alert-info mt-2">
                  <span>{status}</span>
                </div>
              )}
            </div>

            <footer className="footer bg-white text-black items-center px-10 py-4 border-t mt-4">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" width={46} />
                <p>© {currentYear} - All rights reserved</p>
              </aside>
            </footer>
          </div>

          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
              <span className="text-blue-800">Cardano Hub</span> <span className="text-red-600">Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/eadea72b-3c6d-4de1-ad4e-81dd473a973e/u65MPHblsV.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-meedium">Create exclusive NFT access for events</p>
          </div>  
        </div>
      </div>
    </div>
  );
}
