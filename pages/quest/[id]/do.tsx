import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

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

export default function DoQuestPage() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    console.log("DoQuestPage useEffect, id:", id, "auth.currentUser:", auth.currentUser);

    const fetchQuestAndUserData = async () => {
      if (!id || typeof id !== "string") {
        console.log("Invalid or missing id:", id);
        toast.error("Invalid quest ID.");
        setLoading(false);
        return;
      }

      if (!auth.currentUser) {
        console.log("No authenticated user");
        toast.error("Please sign in to view quest.");
        setLoading(false);
        return;
      }

      try {
        const questDoc = await getDoc(doc(db, "quests", id));
        if (questDoc.exists()) {
          setQuest({ id: questDoc.id, ...questDoc.data() } as Quest);
        } else {
          toast.error("Quest not found.");
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            twitterUsername: data.twitterUsername || "",
            discordUsername: data.discordUsername || "",
            walletAddress: data.walletAddress || "",
          });
        } else {
          toast.error("User data not found. Please complete your profile.");
          setLoading(false);
          return;
        }

        const progressDoc = await getDoc(
          doc(db, "quests", id, "userProgress", auth.currentUser.uid)
        );
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
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestAndUserData();
  }, [router.isReady, id]);

const handleTaskSubmit = async (taskIndex: number, task: Task) => {
  if (!userData?.twitterUsername) {
    toast.error('Please add your Twitter username in your profile.');
    return;
  }

  setSubmitting(true);

  try {
    const body = {
      type: task.taskType.toLowerCase(),
      username: userData.twitterUsername,
      target: task.link,
    };

    const response = await fetch('/api/verify-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const verificationResult = await response.json();

    toast[verificationResult.verified ? 'success' : 'error'](verificationResult.message);

    if (verificationResult.verified) {
      const currentProgress = userProgress || {
        tasksCompleted: [],
        pointsCollected: 0,
        walletAddress: userData.walletAddress,
        status: 'pending',
      };

      // Prevent double completion of the same task
      if (!currentProgress.tasksCompleted.some((t) => t.taskIndex === taskIndex)) {
        const newTaskCompletion = {
          taskIndex,
          proof: verificationResult.proof || '',
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

        // Save updated progress to Firestore
        await setDoc(
          doc(db, "quests", quest.id, "userProgress", auth.currentUser!.uid),
          updatedProgress,
          { merge: true }
        );

        setUserProgress(updatedProgress);
      } else {
        toast.info("Task already completed.");
      }
    }
  } catch (error: any) {
    console.error('Error submitting task:', error);
    toast.error(`Failed to submit task: ${error.message || error}`);
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    console.log("DoQuestPage rendering loading state");
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (!quest) {
    console.log("DoQuestPage rendering quest not found state");
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Quest not found.</div>;
  }

  console.log("DoQuestPage rendering main content, quest:", quest);
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{quest.name}</h1>
        <p className="text-gray-600 mb-4">{quest.description}</p>
        <p className="text-sm mb-2">Reward: {quest.reward} {quest.tokenName}</p>
        <p className="text-sm mb-4">Deadline: {new Date(quest.deadline).toLocaleDateString()}</p>
        <p className="text-sm mb-4">Your Points: {userProgress?.pointsCollected || 0}</p>

        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          {quest.tasks && quest.tasks.length > 0 ? (
          quest.tasks.map((task, index) => {
            const isCompleted = userProgress?.tasksCompleted.some((t) => t.taskIndex === index);
            const isFollowTask = task.taskType.toLowerCase().includes("follow");

            return (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-medium text-gray-800">{task.taskType}</h3>
                {isFollowTask ? (
                  <p className="text-sm">
                    Please follow the account:{" "}
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {task.link}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm">
                    Link:{" "}
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {task.link}
                    </a>
                  </p>
                )}
                <p className="text-sm">Points: {task.points}</p>
                {isCompleted ? (
                  <p className="text-green-600 font-semibold">Completed</p>
                ) : (
                  <button
                    onClick={() => handleTaskSubmit(index, task)}
                    disabled={submitting}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Verify Task"}
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p>No tasks available.</p>
        )}

        </div>

        <div className="mt-6">
          <Link
            href="/quests"
            className="inline-block px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Back to Quests
          </Link>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
