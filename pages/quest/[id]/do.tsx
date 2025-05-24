import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import ConnectWallet from "@/components/button/ConnectWallet";
import { fetchTaskHandler, updateUserProgress } from "@/utils/taskverification";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface Task {
  taskType: string;
  link: string;
  points: number;
}

interface UserProgress {
  completedTasks: { taskIndex: number; proof: string; awardedPoints: number; completedAt: string }[];
  totalPoints: number;
  userWallet: string;
  status: "pending" | "verified" | "rewarded";
}

interface Quest {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  reward: number;
  deadline: string;
  tokenPolicyId: string;
  tokenName: string;
  scriptAddress: string;
  status: string;
}

export default function DoQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCredentials, setUserCredentials] = useState<{
    twitterId?: string;
    discordId?: string;
  }>({});
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchQuestAndProgress = async () => {
      if (!id || !auth.currentUser) return;

      try {
        const questDoc = await getDoc(doc(db, "quests", id as string));
        if (questDoc.exists()) {
          setQuest({ id: questDoc.id, ...questDoc.data() } as Quest);

          const progressDoc = await getDoc(
            doc(db, "quests", id as string, "userProgress", auth.currentUser.uid)
          );
          if (progressDoc.exists()) {
            setUserProgress(progressDoc.data() as UserProgress);
          } else {
            setUserProgress({
              completedTasks: [],
              totalPoints: 0,
              userWallet: walletAddress || "",
              status: "pending",
            });
          }
        } else {
          toast.error("Quest not found.");
        }
      } catch (error) {
        console.error("Error fetching quest:", error);
        toast.error("Failed to load quest.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestAndProgress();
  }, [id, walletAddress]);

  const handleTaskSubmit = async (taskIndex: number, task: Task) => {
    if (!auth.currentUser || !walletAddress || !quest) {
      toast.error("Please connect your wallet and sign in.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await fetchTaskHandler(
        quest.id,
        auth.currentUser.uid,
        walletAddress,
        task,
        userCredentials
      );
      toast[result.success ? "success" : "error"](result.message);

      if (result.success) {
        const awardedPoints = task.points;
        const updatedProgress: UserProgress = {
          completedTasks: [
            ...(userProgress?.completedTasks || []),
            {
              taskIndex,
              proof: task.link,
              awardedPoints,
              completedAt: new Date().toISOString(),
            },
          ],
          totalPoints: (userProgress?.totalPoints || 0) + awardedPoints,
          userWallet: walletAddress,
          status: "pending",
        };

        await setDoc(
          doc(db, "quests", quest.id, "userProgress", auth.currentUser.uid),
          updatedProgress
        );
        setUserProgress(updatedProgress);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (!quest) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Quest not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{quest.name}</h1>
        <p className="text-gray-600 mb-4">{quest.description}</p>
        <p className="text-sm mb-2">Reward: {quest.reward} {quest.tokenName}</p>
        <p className="text-sm mb-4">Deadline: {new Date(quest.deadline).toLocaleDateString()}</p>
        <p className="text-sm mb-4">Your Points: {userProgress?.totalPoints || 0}</p>

        <ConnectWallet
          onConnect={(address: string) => setWalletAddress(address)}
          onVerified={(address: string) => setWalletAddress(address)}
        />

        <div className="form-control mb-4">
          <label className="label text-black">Twitter ID (for verification)</label>
          <input
            type="text"
            placeholder="Enter your Twitter ID"
            value={userCredentials.twitterId || ""}
            onChange={(e) => setUserCredentials({ ...userCredentials, twitterId: e.target.value })}
            className="input input-bordered w-full bg-transparent"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label text-black">Discord ID (for verification)</label>
          <input
            type="text"
            placeholder="Enter your Discord ID"
            value={userCredentials.discordId || ""}
            onChange={(e) => setUserCredentials({ ...userCredentials, discordId: e.target.value })}
            className="input input-bordered w-full bg-transparent"
          />
        </div>

        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          {quest.tasks.map((task, index) => {
            const isCompleted = userProgress?.completedTasks.some((t) => t.taskIndex === index);
            return (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-medium text-gray-800">{task.taskType}</h3>
                <p className="text-sm">
                  Link: <a href={task.link} target="_blank" className="text-blue-600 underline">{task.link}</a>
                </p>
                <p className="text-sm">Points: {task.points}</p>
                {isCompleted ? (
                  <p className="text-green-600 font-medium">Completed!</p>
                ) : (
                  <button
                    className="mt-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => handleTaskSubmit(index, task)}
                    disabled={submitting}
                  >
                    {submitting ? "Verifying..." : "Verify Task"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Link href={`/quests/${quest.id}/claim`}>
          <a className="mt-6 inline-block p-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Go to Claim Rewards
          </a>
        </Link>

        <footer className="mt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Cardano Hub Indonesia - All rights reserved</p>
        </footer>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}