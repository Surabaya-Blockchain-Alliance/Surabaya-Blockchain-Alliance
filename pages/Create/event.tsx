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
    tasks: [],
    tokenName: "",
    policyId: "",
    assetName: "",
    assetAddress: "",
  });

  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleTaskChange = (index, e) => {
    const updatedTasks = [...form.tasks];
    const { name, value } = e.target;
    updatedTasks[index][name] = name === "points" ? parseInt(value) || 0 : value;
    setForm({ ...form, tasks: updatedTasks });
  };

  const addTask = (taskType) => {
    setForm({
      ...form,
      tasks: [...form.tasks, { taskType, link: "", points: 1 }],
    });
  };

  const removeTask = (index) => {
    const updatedTasks = form.tasks.filter((_, i) => i !== index);
    setForm({ ...form, tasks: updatedTasks });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!walletAddress) return alert("Wallet not connected.");

    if (
      !form.tokenName ||
      !form.policyId ||
      !form.assetName ||
      !form.assetAddress
    ) {
      return alert("Please fill in all reward token details.");
    }

    try {
      setLoading(true);
      setStatus("Processing quest...");

      const pointsCollected = form.tasks.reduce(
        (total, task) => total + (parseInt(task.points) || 0),
        0
      );

      const res = await fetch("/api/create-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userAddress: walletAddress,
          pointsCollected,
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
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div
            className="bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10 overflow-y-auto"
            style={{ maxHeight: "100vh" }}
          >
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">Create Quest</h1>
              <p className="text-sm font-medium">Enter your quest details</p>
            </div>

            <div className="space-y-4">
              {/* Quest Fields */}
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
                <label className="label text-black">Token Name</label>
                <input
                  type="text"
                  name="tokenName"
                  placeholder="Enter token reward name"
                  value={form.tokenName}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Policy ID</label>
                <input
                  type="text"
                  name="policyId"
                  placeholder="Enter policy ID"
                  value={form.policyId}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Asset Name</label>
                <input
                  type="text"
                  name="assetName"
                  placeholder="Enter asset name"
                  value={form.assetName}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-transparent"
                />
              </div>

              <div className="form-control">
                <label className="label text-black">Asset Address</label>
                <input
                  type="text"
                  name="assetAddress"
                  placeholder="Enter wallet/address holding the token"
                  value={form.assetAddress}
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

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tasks</h3>
                {form.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="form-control flex items-center gap-4"
                  >
                    <input
                      type="text"
                      name="link"
                      value={task.link}
                      onChange={(e) => handleTaskChange(index, e)}
                      placeholder={`Link for ${task.taskType}`}
                      className="input input-bordered w-1/2"
                    />
                    <input
                      type="number"
                      name="points"
                      value={task.points}
                      onChange={(e) => handleTaskChange(index, e)}
                      placeholder="Points"
                      className="input input-bordered w-1/4"
                      min={0}
                    />
                    <button
                      className="btn btn-danger w-1/6"
                      onClick={() => removeTask(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => addTask("Follow Twitter")}
                  >
                    Add Follow Twitter Task
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => addTask("Follow Discord")}
                  >
                    Add Follow Discord Task
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => addTask("Join Discord")}
                  >
                    Add Join Discord Task
                  </button>
                </div>
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
              <span className="text-blue-800">Cardano Hub</span>{" "}
              <span className="text-red-600">Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/7b819196-d55f-494b-b0b1-c78b39656bfe/RD0XuFNO9P.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-medium">
              Complete social actions and earn rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
