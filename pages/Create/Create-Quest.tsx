import { useState } from "react";
import { BsCheck2Circle } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function CreateQuestPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    reward: "",
    deadline: "",
    twitter: "",
    discord: "",
    retweetLink: "",
    likePostLink: "",
    additionalActions: "",
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
      setStatus("Processing quest...");
      const res = await fetch("/api/create-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userAddress: walletAddress,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus(`✅ Quest Created! Quest ID: ${result.questId}`);
      } else {
        setStatus(`❌ Quest creation failed: ${result.error}`);
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
            //background: `url('/img/bg-tile.png') repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div className="bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10 overflow-y-auto" style={{ maxHeight: "100vh" }}>
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">Create Quest</h1>
              <p className="text-sm font-medium">Enter your quest details</p>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label text-black">Quest Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter quest name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Quest Description</label>
                <textarea
                  name="description"
                  placeholder="Enter quest description"
                  value={form.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Reward</label>
                <input
                  type="text"
                  name="reward"
                  placeholder="Enter quest reward"
                  value={form.reward}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Quest Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              {/* Social Media Actions */}
              <div className="form-control">
                <label className="label text-black">Follow Twitter (Link)</label>
                <input
                  type="text"
                  name="twitter"
                  placeholder="Enter Twitter profile link"
                  value={form.twitter}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Join Discord (Invite Link)</label>
                <input
                  type="text"
                  name="discord"
                  placeholder="Enter Discord invite link"
                  value={form.discord}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Retweet Link</label>
                <input
                  type="text"
                  name="retweetLink"
                  placeholder="Enter retweet link"
                  value={form.retweetLink}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Like Post Link</label>
                <input
                  type="text"
                  name="likePostLink"
                  placeholder="Enter like post link"
                  value={form.likePostLink}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Additional Actions (e.g., Share tweet)</label>
                <input
                  type="text"
                  name="additionalActions"
                  placeholder="Other quest actions"
                  value={form.additionalActions}
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
                {loading ? "Creating..." : "Create Quest"}
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
              src="https://lottie.host/7b819196-d55f-494b-b0b1-c78b39656bfe/RD0XuFNO9P.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-medium">Complete social actions and earn rewards!</p>
          </div>  
        </div>
      </div>
    </div>
  );
}
