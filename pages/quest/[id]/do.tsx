import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  description: string;
  tasks: Task[];
  reward: number;
  deadline: string;
  tokenPolicyId: string;
  tokenName: string;
  creatorWalletAddress: string;
  status: string;
}

interface UserData {
  twitterUsername?: string;
  discordUsername?: string;
  walletAddress?: string;
}

function extractTweetId(url: string): string | undefined {
  try {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

function isValidTwitterUsername(username: string): boolean {
  return /^[A-Za-z0-9_]{1,15}$/.test(username);
}

export default function DoQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

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

  const fetchQuestAndUserData = useCallback(async () => {
    if (!router.isReady || !id || typeof id !== "string" || !authReady || !auth.currentUser) {
      console.log("Fetch aborted: ", { isReady: router.isReady, id, authReady, user: !!auth.currentUser });
      if (!id || typeof id !== "string") setError("Invalid quest ID.");
      setLoading(false);
      return;
    }

    try {
      console.time("fetchQuestAndUserData");
      const [questDoc, userDoc, progressDoc] = await Promise.all([
        getDoc(doc(db, "quests", id)),
        getDoc(doc(db, "users", auth.currentUser.uid)),
        getDoc(doc(db, "quests", id, "userProgress", auth.currentUser.uid)),
      ]);

      if (questDoc.exists()) {
        const questData = { id: questDoc.id, ...questDoc.data(), tasks: questDoc.data().tasks || [] } as Quest;
        setQuest(questData);
      } else {
        setError("Quest not found.");
        setLoading(false);
        return;
      }

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          twitterUsername: data.twitterUsername || "",
          discordUsername: data.discordUsername || "",
          walletAddress: data.walletAddress || "",
        });
      } else {
        setError("User data not found. Please complete your profile.");
        setLoading(false);
        return;
      }

      if (progressDoc.exists()) {
        setUserProgress(progressDoc.data() as UserProgress);
      } else {
        setUserProgress({
          tasksCompleted: [],
          pointsCollected: 0,
          walletAddress: userDoc.data()?.walletAddress || "",
          status: "pending",
        });
      }
      console.timeEnd("fetchQuestAndUserData");
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [router.isReady, id, authReady]);

  useEffect(() => {
    if (authReady && auth.currentUser) {
      fetchQuestAndUserData();
    }
  }, [fetchQuestAndUserData, authReady]);

  const verifyTask = async (task: Task, taskIndex: number): Promise<{ verified: boolean; message: string; proof?: string }> => {
    if (!userData || !auth.currentUser) {
      return { verified: false, message: "User data or authentication missing." };
    }

    const { taskType, link } = task;
    const { twitterUsername, discordUsername, walletAddress } = userData;

    try {
      let body: any;
      let apiType: string;

      switch (taskType.toLowerCase()) {
        case "follow twitter":
          if (!twitterUsername || !isValidTwitterUsername(twitterUsername)) {
            return { verified: false, message: "Invalid Twitter username in your profile." };
          }
          if (!isValidTwitterUsername(link)) {
            return { verified: false, message: "Invalid Twitter username for this task." };
          }
          apiType = "follow twitter";
          body = {
            type: apiType,
            username: twitterUsername,
            target: link,
          };
          break;

        case "retweet tweet":
        case "like tweet":
          if (!twitterUsername || !isValidTwitterUsername(twitterUsername)) {
            return { verified: false, message: "Invalid Twitter username in your profile." };
          }
          const tweetId = extractTweetId(link);
          if (!tweetId) {
            return { verified: false, message: "Invalid tweet URL." };
          }
          apiType = taskType.toLowerCase() === "retweet tweet" ? "retweet" : "like";
          body = {
            type: apiType,
            username: twitterUsername,
            tweetId,
          };
          break;

        case "join discord":
          if (!discordUsername) {
            return { verified: false, message: "Please add your Discord username in your profile." };
          }
          const [guildId, roleId] = link.split(":");
          if (!guildId || !roleId) {
            return { verified: false, message: "Invalid Discord guild or role ID." };
          }
          apiType = "join_discord";
          body = {
            type: apiType,
            discordUserId: discordUsername,
            guildId,
            roleId,
          };
          break;

        case "visit website":
          if (!auth.currentUser.uid || !walletAddress) {
            return { verified: false, message: "Please connect your wallet." };
          }
          if (!isValidUrl(link)) {
            return { verified: false, message: "Invalid website URL." };
          }
          apiType = "visit_link";
          body = {
            type: apiType,
            userId: auth.currentUser.uid,
            link,
          };
          break;

        case "check visit website":
          if (!auth.currentUser.uid || !walletAddress) {
            return { verified: false, message: "Please connect your wallet." };
          }
          if (!isValidUrl(link)) {
            return { verified: false, message: "Invalid website URL." };
          }
          apiType = "check_visit_link";
          body = {
            type: apiType,
            userId: auth.currentUser.uid,
            link,
          };
          break;

        default:
          return { verified: false, message: "Unsupported task type." };
      }

      console.time("verifyTask");
      const response = await fetch("/api/verify-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.timeEnd("verifyTask");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        verified: result.verified,
        message: result.message,
        proof: result.data ? JSON.stringify(result.data) : link,
      };
    } catch (error: any) {
      console.error("Task verification error:", error);
      return {
        verified: false,
        message: error.message.includes("User not found")
          ? "Invalid Twitter or Discord username provided."
          : `Task verification failed: ${error.message}`,
      };
    }
  };

  const handleTaskSubmit = async (taskIndex: number, task: Task) => {
    if (!quest || !auth.currentUser) {
      toast.error("Quest or user data missing.");
      return;
    }

    setSubmitting(true);
    try {
      const verificationResult = await verifyTask(task, taskIndex);
      toast[verificationResult.verified ? "success" : "error"](verificationResult.message);

      if (verificationResult.verified) {
        const currentProgress = userProgress || {
          tasksCompleted: [],
          pointsCollected: 0,
          walletAddress: userData?.walletAddress || "",
          status: "pending",
        };

        if (!currentProgress.tasksCompleted.some((t) => t.taskIndex === taskIndex)) {
          const newTaskCompletion = {
            taskIndex,
            proof: verificationResult.proof || task.link,
            awardedPoints: task.points,
            completedAt: new Date().toISOString(),
          };

          const updatedTasksCompleted = [...currentProgress.tasksCompleted, newTaskCompletion];
          const updatedPoints = currentProgress.pointsCollected + task.points;

          const updatedProgress: UserProgress = {
            ...currentProgress,
            tasksCompleted: updatedTasksCompleted,
            pointsCollected: updatedPoints,
          };

          await setDoc(
            doc(db, "quests", quest.id, "userProgress", auth.currentUser.uid),
            updatedProgress,
            { merge: true }
          );

          setUserProgress(updatedProgress);
        } else {
          toast.info("Task already completed.");
        }
      }
    } catch (error: any) {
      console.error("Error submitting task:", error);
      toast.error(`Failed to submit task: ${error.message || error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskRedirect = (task: Task) => {
    const { taskType, link } = task;
    switch (taskType.toLowerCase()) {
      case "follow twitter":
        if (isValidTwitterUsername(link)) {
          window.location.href = `https://twitter.com/${link}`;
        } else {
          toast.error("Invalid Twitter username for this task.");
        }
        break;
      case "visit website":
      case "check visit website":
        if (isValidUrl(link)) {
          window.location.href = link;
        } else {
          toast.error("Invalid website URL.");
        }
        break;
      case "retweet tweet":
      case "like tweet":
        if (isValidUrl(link)) {
          window.location.href = link;
        } else {
          toast.error("Invalid tweet URL.");
        }
        break;
      case "join discord":
        const [inviteCode] = link.split(":");
        if (inviteCode) {
          window.location.href = `https://discord.com/invite/${inviteCode}`;
        } else {
          toast.error("Invalid Discord invite code.");
        }
        break;
      default:
        toast.error("Unsupported task type for redirect.");
    }
  };

  const bgImage: string =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

  if (loading || !authReady) {
    console.log("Rendering loading state");
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
          background: `url(${bgImage}) repeat 0 0`,
          animation: "bg-scrolling-reverse 0.92s linear infinite",
        }}
      >
        <div className="text-black font-semibold bg-white p-4 rounded-lg shadow-md">Loading quest data...</div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
          background: `url(${bgImage}) repeat 0 0`,
          animation: "bg-scrolling-reverse 0.92s linear infinite",
        }}
      >
        <div className="text-black font-semibold bg-white p-4 rounded-lg shadow-md">{error}</div>
      </div>
    );
  }

  if (!quest) {
    console.log("Rendering quest not found state");
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
          background: `url(${bgImage}) repeat 0 0`,
          animation: "bg-scrolling-reverse 0.92s linear infinite",
        }}
      >
        <div className="text-black font-semibold bg-white p-4 rounded-lg shadow-md">Quest not found.</div>
      </div>
    );
  }

  console.log("Rendering main content, quest:", quest);
  return (
    <div
      className="min-h-screen w-full"
      style={{
        fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
        background: `url(${bgImage}) repeat 0 0`,
        animation: "bg-scrolling-reverse 0.92s linear infinite",
      }}
    >
      <div className="flex flex-col items-center p-4">
        {/* Hero Section */}
        <div className="bg-white max-w-3xl w-full p-8 rounded-xl shadow-2xl mb-6">
          <div className="flex justify-between items-center mb-6">
            <img src="/img/logo.png" alt="Cardano Hub Indonesia" className="h-full" width={130} />
            <Link href="/quest" className="bg-black rounded-lg text-white px-3 py-1.5 text-xs">
              Back to Quests
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            <span className="text-blue-800">Cardano Hub</span>{" "}
            <span className="text-red-600">Indonesia</span>: {quest.name}
          </h1>
          <DotLottieReact
            src="https://lottie.host/300794aa-cd62-4cdf-89ac-3463b38d29a7/wVcfBSixSv.lottie"
            loop
            autoplay
            className="w-48 h-48 mx-auto mb-4"
          />
          <p className="text-black text-base font-medium mb-4">{quest.description}</p>
        </div>

        {/* Task Section */}
        <div className="bg-white max-w-3xl w-full p-8 rounded-xl shadow-md">
          <p className="text-black text-sm mb-2">
            Reward: {quest.reward} {quest.tokenName}
          </p>
          <p className="text-black text-sm mb-2">
            Deadline: {new Date(quest.deadline).toLocaleDateString()}
          </p>
          <p className="text-black text-sm mb-4">
            Your Points: {userProgress?.pointsCollected || 0}
          </p>

          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold text-black">Tasks</h2>
            {quest.tasks && quest.tasks.length > 0 ? (
              quest.tasks.map((task, index) => {
                const isCompleted = userProgress?.tasksCompleted.some((t) => t.taskIndex === index);
                const isTwitterTask = ["follow twitter", "retweet tweet", "like tweet"].includes(
                  task.taskType.toLowerCase()
                );
                const isDiscordTask = task.taskType.toLowerCase() === "join discord";
                const isVisitTask = ["visit website", "check visit website"].includes(
                  task.taskType.toLowerCase()
                );

                return (
                  <div
                    key={index}
                    className="border border-gray-200 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-black">{task.taskType}</h3>
                    <p className="text-black text-sm mt-1">
                      {isTwitterTask
                        ? `Visit the Twitter account or tweet to complete this task.`
                        : isDiscordTask
                        ? `Join the Discord server to complete this task.`
                        : isVisitTask
                        ? `Visit the website to complete this task.`
                        : `Complete the task at: ${task.link}`}
                    </p>
                    <p className="text-black text-sm mt-1">Points: {task.points}</p>
                    <div className="mt-3 flex gap-3">
                      {!isCompleted && (
                        <button
                          onClick={() => handleTaskRedirect(task)}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          {isTwitterTask
                            ? "Go to Twitter"
                            : isDiscordTask
                            ? "Join Discord"
                            : isVisitTask
                            ? "Visit Website"
                            : "Go to Task"}
                        </button>
                      )}
                      {isCompleted ? (
                        <p className="text-black font-semibold">Completed</p>
                      ) : (
                        <button
                          onClick={() => handleTaskSubmit(index, task)}
                          disabled={
                            submitting ||
                            (isTwitterTask && !userData?.twitterUsername) ||
                            (isDiscordTask && !userData?.discordUsername)
                          }
                          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? "Submitting..." : "Verify Task"}
                        </button>
                      )}
                    </div>
                    {isTwitterTask && !userData?.twitterUsername && (
                      <p className="text-black text-sm mt-2">
                        Please add your Twitter username in your profile to verify this task.
                      </p>
                    )}
                    {isDiscordTask && !userData?.discordUsername && (
                      <p className="text-black text-sm mt-2">
                        Please add your Discord username in your profile to verify this task.
                      </p>
                    )}
                    {isVisitTask && !userData?.walletAddress && (
                      <p className="text-black text-sm mt-2">
                        Please connect your wallet to verify this task.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-black text-sm">No tasks available.</p>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/quest"
              className="inline-block px-6 py-2 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Quests
            </Link>
            <Link
              href={`/quest/${quest.id}/claim`}
              className="inline-block px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Claim Rewards
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}