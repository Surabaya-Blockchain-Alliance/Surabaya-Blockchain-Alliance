import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import ConnectWallet from "@/components/button/ConnectWallet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Task {
  taskType: string;
  link: string;
  points: number;
}

interface UserProgress {
  tasksCompleted: { taskIndex: number; proof: string; awardedPoints: number; completedAt: string }[];
  pointsCollected: number; // Aligned with DoQuestPage
  walletAddress: string;
  status: "pending" | "verified" | "rewarded";
}

interface Quest {
  id: string;
  name: string;
  reward: number;
  tokenPolicyId: string;
  tokenName: string;
  scriptAddress: string; // Note: DoQuestPage uses creatorWalletAddress
  deadline: string;
  status: string;
  tasks: Task[];
}

export default function ClaimQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  // Handle auth state and redirect if not signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", !!user);
      setAuthReady(true);
      if (!user && authReady) {
        console.log("Redirecting to /signin");
        router.push({
          pathname: "/signin",
          query: { redirect: router.asPath },
        });
      }
    });
    return () => unsubscribe();
  }, [authReady, router]);

  // Fetch quest and user progress
  const fetchQuestAndProgress = useCallback(async () => {
    if (!router.isReady || !id || typeof id !== "string" || !authReady || !auth.currentUser) {
      console.log("Fetch aborted: ", { isReady: router.isReady, id, authReady, user: !!auth.currentUser });
      if (!id || typeof id !== "string") toast.error("Invalid quest ID.");
      setLoading(false);
      return;
    }

    try {
      console.time("fetchQuestAndProgress");
      const [questDoc, progressDoc] = await Promise.all([
        getDoc(doc(db, "quests", id)),
        getDoc(doc(db, "quests", id, "userProgress", auth.currentUser.uid)),
      ]);

      if (questDoc.exists()) {
        setQuest({ id: questDoc.id, ...questDoc.data(), tasks: questDoc.data().tasks || [] } as Quest);
      } else {
        toast.error("Quest not found.");
        setLoading(false);
        return;
      }

      if (progressDoc.exists()) {
        const data = progressDoc.data() as UserProgress;
        setUserProgress({
          tasksCompleted: data.tasksCompleted || [], // Align with DoQuestPage
          pointsCollected: data.pointsCollected || data.totalPoints || 0, // Support both fields
          walletAddress: data.walletAddress || data.userWallet || walletAddress || "",
          status: data.status || "pending",
        });
      } else {
        setUserProgress({
          tasksCompleted: [],
          pointsCollected: 0,
          walletAddress: walletAddress || "",
          status: "pending",
        });
      }
      console.timeEnd("fetchQuestAndProgress");
    } catch (error: any) {
      console.error("Error fetching quest:", error);
      toast.error(`Failed to load quest: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, walletAddress, router.isReady, authReady]);

  useEffect(() => {
    if (authReady && auth.currentUser) {
      fetchQuestAndProgress();
    }
  }, [fetchQuestAndProgress, authReady]);

  // Calculate eligible reward
  const calculateEligibleReward = (): { eligible: boolean; rewardAmount: number; message: string } => {
    if (!quest || !userProgress) {
      return { eligible: false, rewardAmount: 0, message: "Quest or user progress not loaded." };
    }

    if (userProgress.pointsCollected === 0) {
      return { eligible: false, rewardAmount: 0, message: "No points earned yet." };
    }

    if (userProgress.status === "rewarded") {
      return { eligible: false, rewardAmount: 0, message: "Reward already claimed." };
    }

    if (new Date(quest.deadline) < new Date()) {
      return { eligible: false, rewardAmount: 0, message: "Quest deadline has passed." };
    }

    const totalTaskPoints = quest.tasks.reduce((sum, task) => sum + task.points, 0);
    if (totalTaskPoints === 0) {
      return { eligible: false, rewardAmount: 0, message: "No points available in quest." };
    }

    const rewardAmount = Math.floor(
      (userProgress.pointsCollected / totalTaskPoints) * quest.reward
    );

    return {
      eligible: true,
      rewardAmount,
      message: `Eligible for ${rewardAmount} ${quest.tokenName}`,
    };
  };

  const handleClaimReward = async () => {
    if (!walletApi || !walletAddress || !quest || !userProgress) {
      toast.error("Please connect your wallet.");
      return;
    }

    const { eligible, rewardAmount, message } = calculateEligibleReward();
    if (!eligible) {
      toast.error(message);
      return;
    }

    setSubmitting(true);
    try {
      console.time("claimReward");
      const response = await fetch("/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          userAddress: walletAddress,
          walletApi,
          rewardAmount, // Pass calculated reward
        }),
      });

      const result = await response.json();
      if (response.ok) {
        await setDoc(
          doc(db, "quests", quest.id, "userProgress", auth.currentUser!.uid),
          { status: "rewarded", walletAddress }, // Update walletAddress
          { merge: true }
        );
        setUserProgress({ ...userProgress, status: "rewarded", walletAddress });
        toast.success(`Reward claimed! Tx Hash: ${result.txHash}`);
        setTimeout(() => router.push("/quest"), 2000);
      } else {
        throw new Error(result.error || "Claim failed.");
      }
      console.timeEnd("claimReward");
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      toast.error(`Failed to claim reward: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-black">Loading quest data...</div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-black">Quest not found.</div>
      </div>
    );
  }

  const { rewardAmount } = calculateEligibleReward();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-black mb-2">Claim Rewards: {quest.name}</h1>
        <p className="text-sm mb-2">Total Reward Pool: {quest.reward} {quest.tokenName}</p>
        <p className="text-sm mb-4">Your Points: {userProgress?.pointsCollected || 0}</p>
        <p className="text-sm mb-4">
          Eligible Reward: {rewardAmount} {quest.tokenName}
        </p>

        <ConnectWallet
          onConnect={(address: string, api: any) => {
            setWalletAddress(address);
            setWalletApi(api);
          }}
          onVerified={(address: string) => setWalletAddress(address)}
        />

        <button
          className="w-full p-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          onClick={handleClaimReward}
          disabled={submitting || userProgress?.status === "rewarded" || userProgress?.pointsCollected === 0}
        >
          {submitting
            ? "Claiming..."
            : userProgress?.status === "rewarded"
            ? "Reward Claimed"
            : "Claim Reward"}
        </button>

        <footer className="mt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Cardano Hub Indonesia - All rights reserved</p>
        </footer>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}