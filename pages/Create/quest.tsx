import { useState, useEffect } from "react";
import { BsCheck2Circle } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { convertTwitterUsernamesToIds } from "@/utils/Socialhandler";
import { doc, setDoc, collection as collectionRef } from "firebase/firestore";
import { db, auth } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Task {
  taskType: string;
  link: string;
  points: number;
}

interface FormState {
  name: string;
  description: string;
  reward: string;
  deadline: string;
  tasks: Task[];
  tokenPolicyId: string;
  tokenName: string;
  adminWalletAddress: string;
}

export default function CreateQuestPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    reward: "",
    deadline: "",
    tasks: [],
    tokenPolicyId: "",
    tokenName: "",
    adminWalletAddress: "",
  });

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{
    twitterId?: string;
    discordId?: string;
  }>({});
  const [twitterTaskModal, setTwitterTaskModal] = useState<{
    open: boolean;
    taskType: string;
    usernames: string;
    tweetUrl?: string;
  }>({ open: false, taskType: "", usernames: "" });

  const router = useRouter();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleTaskChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedTasks = [...form.tasks];
    const { name, value } = e.target;
    updatedTasks[index][name] =
      name === "points" ? Math.max(1, parseInt(value) || 1) : value;
    setForm({ ...form, tasks: updatedTasks });
  };

  const addTask = (taskType: string) => {
    if (["Follow Twitter", "Retweet Tweet", "Like Tweet"].includes(taskType)) {
      setTwitterTaskModal({ open: true, taskType, usernames: "", tweetUrl: "" });
    } else {
      setForm({
        ...form,
        tasks: [...form.tasks, { taskType, link: "", points: 1 }],
      });
    }
  };

  const handleAddTwitterTask = async () => {
    const { taskType, usernames, tweetUrl } = twitterTaskModal;

    if (taskType === "Follow Twitter") {
      if (!usernames.trim()) {
        toast.error("Please enter at least one Twitter username.");
        return;
      }

      try {
        const usernameList = usernames
          .split(",")
          .map((u) => u.trim())
          .filter((u) => u);
        const usernameToIdMap = await convertTwitterUsernamesToIds(usernameList);

        const validMap: { [username: string]: string } = {};
        for (const [username, id] of Object.entries(usernameToIdMap)) {
          if (id) validMap[username] = id;
          else toast.warn(`Username @${username} not found and will be skipped.`);
        }

        if (Object.keys(validMap).length === 0) {
          toast.error("No valid Twitter usernames provided.");
          return;
        }

        const link = JSON.stringify(validMap);
        setForm({
          ...form,
          tasks: [...form.tasks, { taskType, link, points: 1 }],
        });
        setTwitterTaskModal({
          open: false,
          taskType: "",
          usernames: "",
          tweetUrl: "",
        });
      } catch (error: any) {
        toast.error(`Failed to add Twitter task: ${error.message}`);
      }
    } else {
      if (!tweetUrl?.trim()) {
        toast.error("Please enter a tweet URL.");
        return;
      }
      const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1];
      if (!tweetId) {
        toast.error("Invalid tweet URL.");
        return;
      }

      setForm({
        ...form,
        tasks: [...form.tasks, { taskType, link: tweetUrl, points: 1 }],
      });
      setTwitterTaskModal({
        open: false,
        taskType: "",
        usernames: "",
        tweetUrl: "",
      });
    }
  };

  const removeTask = (index: number) => {
    const updatedTasks = form.tasks.filter((_, i) => i !== index);
    setForm({ ...form, tasks: updatedTasks });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateQuest = async () => {
    if (!auth.currentUser) {
      toast.error("User not authenticated. Please sign in.");
      return;
    }
    if (
      !form.name ||
      !form.description ||
      !form.tokenPolicyId ||
      !form.tokenName ||
      !form.reward ||
      !form.deadline ||
      !form.adminWalletAddress || 
      form.tasks.length === 0 ||
      form.tasks.some((task) => !task.link)
    ) {
      toast.error("Please fill all fields, including task links and admin wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Creating quest...");

      const rewardNum = parseInt(form.reward);
      if (isNaN(rewardNum) || rewardNum < 0) {
        toast.error("Reward must be a valid positive number.");
        return;
      }

      const questRef = doc(collectionRef(db, "quests"));
      const questData = {
        ...form,
        reward: rewardNum,
        creatorUid: auth.currentUser.uid,
        status: "active",
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: form.deadline,
        id: questRef.id,
      };

      await setDoc(questRef, questData);

      // Initialize reward pool
      const initResponse = await fetch("/api/initialize-reward-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: questRef.id,
          tokenPolicyId: form.tokenPolicyId,
          tokenName: form.tokenName,
          reward: rewardNum,
          adminWalletAddress: walletAddress,
        }),
      });

      const initResult = await initResponse.json();
      if (!initResponse.ok) {
        throw new Error(initResult.error);
      }

      // Update quest with script address
      await setDoc(questRef, { scriptAddress: initResult.scriptAddress }, { merge: true });

      setStatus(`✅ Quest Created! ID: ${questRef.id}, Tx Hash: ${initResult.txHash}`);
      router.push(`/quests/${questRef.id}/do`);
    } catch (err: any) {
      console.error("Error:", err);
      setStatus(`❌ Error: ${err.message}`);
      toast.error(`Failed to create quest: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center mt-20">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        className="w-full h-screen text-gray-800 flex flex-col md:flex-row justify-between items-start gap-5"
        style={{ fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif' }}
      >
        <div className="bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10 max-h-[100vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <img src="/img/logo.png" alt="logo" width={200} />
          </div>

          <div className="pt-16 pb-5">
            <h1 className="text-3xl font-extrabold">Create Quest</h1>
            <p className="text-sm font-medium">Enter your quest and reward pool details</p>
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
                rows={4}
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Total Reward (Tokens)</label>
              <input
                type="number"
                name="reward"
                placeholder="Enter total token reward"
                value={form.reward}
                onChange={handleChange}
                className="input input-bordered w-full bg-transparent"
                min="0"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Token Policy ID</label>
              <input
                type="text"
                name="tokenPolicyId"
                placeholder="Enter token policy ID"
                value={form.tokenPolicyId}
                onChange={handleChange}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Token Name</label>
              <input
                type="text"
                name="tokenName"
                placeholder="Enter token name"
                value={form.tokenName}
                onChange={handleChange}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Admin Wallet Address</label>
              <input
                type="text"
                name="adminWalletAddress"
                placeholder="Enter admin wallet address"
                value={walletAddress}
                onChange={handleChange}
                className="input input-bordered w-full bg-transparent"
              />
            </div>

            <div className="form-control">
              <label className="label text-black">Claim Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="input input-bordered w-full bg-transparent"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Tasks</h3>
              {form.tasks.map((task, index) => (
                <div key={index} className="form-control flex items-center gap-4">
                  <input
                    type="text"
                    name="link"
                    value={task.link}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder={`Link for ${task.taskType}`}
                    className="input input-bordered w-1/2"
                    disabled={task.taskType === "Follow Twitter"}
                  />
                  <input
                    type="number"
                    name="points"
                    value={task.points}
                    onChange={(e) => handleTaskChange(index, e)}
                    placeholder="Points"
                    className="input input-bordered w-1/4"
                    min="1"
                  />
                  <button
                    className="btn btn-danger w-1/6"
                    onClick={() => removeTask(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="flex gap-4 flex-wrap">
                <button className="btn btn-primary" onClick={() => addTask("Follow Twitter")}>
                  Add Follow Twitter Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Join Discord")}>
                  Add Join Discord Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Retweet Tweet")}>
                  Add Retweet Tweet Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Like Tweet")}>
                  Add Like Tweet Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Visit Website")}>
                  Add Visit Website Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Own NFT")}>
                  Add Own NFT Task
                </button>
                <button className="btn btn-primary" onClick={() => addTask("Attend Event")}>
                  Add Attend Event Task
                </button>
              </div>
            </div>

            <ConnectWallet
              onConnect={(address: string) => setWalletAddress(address)}
              onVerified={(address: string) => setWalletAddress(address)}
            />

            <button
              className="btn w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center disabled:opacity-50"
              onClick={handleCreateQuest}
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
              <img src="/img/emblem.png" alt="emblem" width={46} />
              <p>© {currentYear} Cardano Hub Indonesia - All rights reserved</p>
            </aside>
          </footer>
        </div>

        <div className="bg-transparent text-center p-10 md:p-48 flex-1">
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
          <p className="text-lg font-medium">Create quests and engage communities!</p>
        </div>
      </div>

      {twitterTaskModal.open && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add {twitterTaskModal.taskType} Task</h3>
            <div className="form-control">
              {twitterTaskModal.taskType === "Follow Twitter" ? (
                <>
                  <label className="label text-black">Twitter Usernames (comma-separated)</label>
                  <textarea
                    placeholder="e.g., user1,user2,user3"
                    value={twitterTaskModal.usernames}
                    onChange={(e) =>
                      setTwitterTaskModal({ ...twitterTaskModal, usernames: e.target.value })
                    }
                    className="textarea textarea-bordered w-full bg-transparent"
                    rows={3}
                  />
                </>
              ) : (
                <>
                  <label className="label text-black">Tweet URL</label>
                  <input
                    type="text"
                    placeholder="e.g., https://twitter.com/user/status/123456789"
                    value={twitterTaskModal.tweetUrl || ""}
                    onChange={(e) =>
                      setTwitterTaskModal({ ...twitterTaskModal, tweetUrl: e.target.value })
                    }
                    className="input input-bordered w-full bg-transparent"
                  />
                </>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <button className="btn btn-primary w-1/2" onClick={handleAddTwitterTask}>
                Add Task
              </button>
              <button
                className="btn btn-secondary w-1/2"
                onClick={() =>
                  setTwitterTaskModal({ open: false, taskType: "", usernames: "", tweetUrl: "" })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}