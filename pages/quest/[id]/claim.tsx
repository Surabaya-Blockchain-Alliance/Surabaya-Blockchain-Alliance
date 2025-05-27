import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import ConnectWallet from "@/components/button/ConnectWallet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

interface Task {
  taskType: string;
  link: string;
  points: number;
}

interface UserProgress {
  tasksCompleted: { taskIndex: number; proof: string; awardedPoints: number; completedAt: string }[];
  pointsCollected: number;
  walletAddress: string;
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
  tasks: Task[];
}

interface AllQuests {
  id: string;
  name: string;
  description: string;
  reward: string;
  deadline: string;
  status: string;
  creator: string;
  avatars?: string;
  media?: string[];
}

export default function ClaimQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [allQuests, setAllQuests] = useState<AllQuests[]>([]);
  const [hasActiveQuests, setHasActiveQuests] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;

  // Fetch all quests for active quests check
  useEffect(() => {
    const fetchAllQuests = async () => {
      try {
        const questsSnapshot = await getDocs(collection(db, "quests"));
        const questsData = questsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AllQuests[];
        setAllQuests(questsData);

        const active = questsData.some((q) => {
          const deadlineDate = new Date(q.deadline);
          const currentDate = new Date(); // May 28, 2025, 03:02 AM WIB
          const isNotPastDeadline = deadlineDate >= currentDate;
          const isNotEnded = q.status.toLowerCase() !== "end";
          return isNotPastDeadline && isNotEnded;
        });
        setHasActiveQuests(active);
      } catch (err: any) {
        console.error("Error fetching quests:", err);
        toast.error("Failed to check active quests.");
      }
    };
    fetchAllQuests();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (!user && authReady) {
        router.push({
          pathname: "/signin",
          query: { redirect: router.asPath },
        });
      }
    });
    return () => unsubscribe();
  }, [authReady, router]);

  const fetchQuestAndProgress = useCallback(async () => {
    if (!router.isReady || !id || typeof id !== "string" || !authReady || !auth.currentUser) {
      if (!id) toast.error("Invalid quest ID.");
      setLoading(false);
      return;
    }

    try {
      const [questDoc, progressDoc] = await Promise.all([
        getDoc(doc(db, "quests", id)),
        getDoc(doc(db, "quests", id, "userProgress", auth.currentUser.uid)),
      ]);

      if (!questDoc.exists()) {
        toast.error("Quest not found.");
        setLoading(false);
        return;
      }
      setQuest({ id: questDoc.id, ...questDoc.data(), tasks: questDoc.data().tasks || [] } as Quest);

      if (progressDoc.exists()) {
        const data = progressDoc.data();
        setUserProgress({
          tasksCompleted: data.tasksCompleted || [],
          pointsCollected: data.pointsCollected || data.totalPoints || 0,
          walletAddress: data.walletAddress || "",
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
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load quest.");
    } finally {
      setLoading(false);
    }
  }, [id, walletAddress, router.isReady, authReady]);

  useEffect(() => {
    if (authReady && auth.currentUser) {
      fetchQuestAndProgress();
    }
  }, [fetchQuestAndProgress, authReady]);

  const calculateEligibleReward = (): { eligible: boolean; rewardAmount: number; message: string } => {
    if (!quest || !userProgress) {
      return { eligible: false, rewardAmount: 0, message: "Loading..." };
    }

    const currentDate = new Date();
    const deadlineDate = new Date(quest.deadline);
    const isEnded = deadlineDate < currentDate || quest.status.toLowerCase() === "end";

    if (!isEnded) {
      return { eligible: false, rewardAmount: 0, message: "Quest has not ended yet." };
    }

    if (userProgress.pointsCollected === 0) {
      return { eligible: false, rewardAmount: 0, message: "No points earned." };
    }

    if (userProgress.status === "rewarded") {
      return { eligible: false, rewardAmount: 0, message: "Reward already claimed." };
    }

    const totalTaskPoints = quest.tasks.reduce((sum, task) => sum + task.points, 0);
    if (totalTaskPoints === 0) {
      return { eligible: false, rewardAmount: 0, message: "No points available." };
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
      const response = await fetch("/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          userAddress: walletAddress,
          walletApi,
          rewardAmount,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        await setDoc(
          doc(db, "quests", quest.id, "userProgress", auth.currentUser!.uid),
          { status: "rewarded", walletAddress },
          { merge: true }
        );
        setUserProgress({ ...userProgress, status: "rewarded", walletAddress });
        toast.success(`Reward claimed! Tx: ${result.txHash.slice(0, 6)}...`);
        setTimeout(() => router.push("/quest"), 1500);
      } else {
        throw new Error(result.message || "Claim failed.");
      }
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.message || "Failed to claim reward.");
    } finally {
      setSubmitting(false);
    }
  };

  const bgImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

  if (loading || !authReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
          background: `url(${bgImage}) repeat 0 0`,
          animation: "bg-scrolling-reverse 0.92s linear infinite",
        }}
      >
        <div className="text-black font-semibold bg-white p-4 rounded-lg shadow-md">
          Loading quest data...
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
          background: `url(${bgImage}) repeat 0 0`,
          animation: "bg-scrolling-reverse 0.92s linear infinite",
        }}
      >
        <div className="text-black font-semibold bg-white p-4 rounded-lg shadow-md">
          Quest not found.
        </div>
      </div>
    );
  }

  const { eligible, rewardAmount, message } = calculateEligibleReward();

  return (
    <div
      className="relative min-h-screen flex flex-col text-black overflow-hidden"
      style={{
        fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
        background: `url(${bgImage}) repeat 0 0`,
        animation: "bg-scrolling-reverse 0.92s linear infinite",
      }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      <div className="relative z-10 flex flex-col items-center p-4">
        <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-lg">
          {hasActiveQuests && (
            <Link
              href="/"
              className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center mb-4"
            >
              <BsArrowLeft className="text-xs" />
              <span className={`font-semibold ${geistTeko.variable}`}>Back to Home</span>
            </Link>
          )}
          <h1 className="text-3xl font-extrabold text-black mb-2">Claim Rewards: {quest.name}</h1>
          <p className="text-sm mb-2">Total Reward Pool: {quest.reward} {quest.tokenName}</p>
          <p className="text-sm mb-2">Your Points: {userProgress?.pointsCollected || 0}</p>
          <p className="text-sm mb-4">Eligible Reward: {rewardAmount} {quest.tokenName}</p>
          {!eligible && <p className="text-sm text-red-600 mb-4">{message}</p>}

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
            disabled={submitting || !eligible}
          >
            {submitting ? "Claiming..." : "Claim Reward"}
          </button>

          <footer className="mt-8 text-center text-gray-600">
            <p>© {new Date().getFullYear()} Cardano Hub Indonesia - All rights reserved</p>
          </footer>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}