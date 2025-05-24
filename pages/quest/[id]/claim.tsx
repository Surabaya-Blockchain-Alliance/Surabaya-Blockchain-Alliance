import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import ConnectWallet from "@/components/button/ConnectWallet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserProgress {
  completedTasks: { taskIndex: number; proof: string; awardedPoints: number; completedAt: string }[];
  totalPoints: number;
  userWallet: string;
  status: "pending" | "verified" | "rewarded";
}

interface Quest {
  id: string;
  name: string;
  reward: number;
  tokenPolicyId: string;
  tokenName: string;
  scriptAddress: string;
  deadline: string;
  status: string;
  tasks: { taskType: string; link: string; points: number }[];
}

export default function ClaimQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const handleClaimReward = async () => {
    if (!walletApi || !walletAddress || !quest || !userProgress) {
      toast.error("Please connect your wallet.");
      return;
    }

    if (userProgress.totalPoints === 0) {
      toast.error("No points earned yet.");
      return;
    }

    if (userProgress.status === "rewarded") {
      toast.error("Reward already claimed.");
      return;
    }

    if (new Date(quest.deadline) < new Date()) {
      toast.error("Quest deadline has passed.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          userAddress: walletAddress,
          walletApi,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        await setDoc(
          doc(db, "quests", quest.id, "userProgress", auth.currentUser!.uid),
          { status: "rewarded" },
          { merge: true }
        );
        setUserProgress({ ...userProgress, status: "rewarded" });
        toast.success(`Reward claimed! Tx Hash: ${result.txHash}`);
        setTimeout(() => router.push("/quests"), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      toast.error(`Failed to claim reward: ${error.message}`);
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
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Claim Rewards: {quest.name}</h1>
        <p className="text-sm mb-2">Total Reward Pool: {quest.reward} {quest.tokenName}</p>
        <p className="text-sm mb-4">Your Points: {userProgress?.totalPoints || 0}</p>
        <p className="text-sm mb-4">
          Estimated Reward: {userProgress?.totalPoints ? Math.floor((quest.reward * userProgress.totalPoints) / quest.tasks.reduce((sum, task) => sum + task.points, 0)) : 0} {quest.tokenName}
        </p>

        <ConnectWallet
          onConnect={(address: string, api: any) => {
            setWalletAddress(address);
            setWalletApi(api);
          }}
          onVerified={(address: string) => setWalletAddress(address)}
        />

        <button
          className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800"
          onClick={handleClaimReward}
          disabled={submitting || userProgress?.status === "rewarded" || !userProgress?.totalPoints}
        >
          {submitting ? "Claiming..." : userProgress?.status === "rewarded" ? "Reward Claimed" : "Claim Reward"}
        </button>

        <footer className="mt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Cardano Hub Indonesia - All rights reserved</p>
        </footer>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}