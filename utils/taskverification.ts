import axios from "axios";
import { doc, setDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/config";

const TWITTER_API_IO_KEY = process.env.TWITTER_API_IO_KEY;
const TWITTER_API_IO_BASE_URL = process.env.TWITTER_API_IO_BASE_URL;

const twitterApiIoClient = axios.create({
  baseURL: TWITTER_API_IO_BASE_URL,
  headers: { "X-API-Key": TWITTER_API_IO_KEY },
});

async function getUserFollowings(username: string, cursor = "", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching followings for username: ${username}, cursor: ${cursor}, attempt: ${i + 1}`);
      const response = await twitterApiIoClient.get(`/${username}/followings`, {
        params: { cursor },
      });
      console.log(`Followings API response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user followings:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`Failed to fetch followings: ${error.message}`);
    }
  }
}

async function getTweetRetweeters(tweetId: string, cursor = "", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching retweeters for tweetId: ${tweetId}, cursor: ${cursor}, attempt: ${i + 1}`);
      const response = await twitterApiIoClient.get("/tweet/retweeters", {
        params: { tweetId, cursor },
      });
      console.log(`Retweeters API response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching tweet retweeters:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`Failed to fetch retweeters: ${error.message}`);
    }
  }
}

async function getTweetLikers(tweetId: string, cursor = "", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching likers for tweetId: ${tweetId}, cursor: ${cursor}, attempt: ${i + 1}`);
      const response = await twitterApiIoClient.get("/tweet/likers", {
        params: { tweetId, cursor },
      });
      console.log(`Likers API response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching tweet likers:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`Failed to fetch likers: ${error.message}`);
    }
  }
}

export async function fetchTaskHandler(
  questId: string,
  userId: string,
  walletAddress: string,
  task: { taskType: string; link: string; points: number; index?: number },
  userCredentials: { twitterId?: string; discordId?: string; twitterUsername?: string }
) {
  try {
    let success = false;
    let message = "";

    switch (task.taskType) {
      case "Follow Twitter":
        if (!userCredentials.twitterUsername) {
          throw new Error("Twitter username not provided in userCredentials");
        }
        if (!task.link || typeof task.link !== "string") {
          throw new Error("Invalid Twitter handle provided");
        }

        const targetUsername = task.link.trim().replace(/^@/, "");
        if (!targetUsername.match(/^[a-zA-Z0-9_]{1,15}$/)) {
          throw new Error("Invalid Twitter handle format");
        }

        let allFollowings: { username: string }[] = [];
        let followCursor = "";
        let hasNextFollowPage = true;

        while (hasNextFollowPage) {
          const followData = await getUserFollowings(userCredentials.twitterUsername, followCursor);
          if (!followData || !Array.isArray(followData.followings)) {
            throw new Error("Invalid followings data from API");
          }
          allFollowings = allFollowings.concat(followData.followings || []);
          hasNextFollowPage = followData.has_next_page || false;
          followCursor = followData.next_cursor || "";
        }

        success = allFollowings.some(
          (user) => user.username.toLowerCase() === targetUsername.toLowerCase()
        );
        message = success
          ? `Successfully verified follow for @${targetUsername}`
          : `Please follow @${targetUsername} to complete this task`;
        break;

      case "Retweet Tweet":
      case "Like Tweet":
        if (!userCredentials.twitterUsername) {
          throw new Error("Twitter username not provided in userCredentials");
        }

        const tweetId = task.link.match(/status\/(\d+)/)?.[1];
        if (!tweetId) {
          throw new Error("Invalid tweet URL");
        }

        let allUsers: { username: string }[] = [];
        let userCursor = "";
        let hasNextUserPage = true;

        if (task.taskType === "Retweet Tweet") {
          while (hasNextUserPage) {
            const retweetData = await getTweetRetweeters(tweetId, userCursor);
            if (!retweetData || !Array.isArray(retweetData.users)) {
              throw new Error("Invalid retweeters data from API");
            }
            allUsers = allUsers.concat(retweetData.users || []);
            hasNextUserPage = retweetData.has_next_page || false;
            userCursor = retweetData.next_cursor || "";
          }
        } else if (task.taskType === "Like Tweet") {
          while (hasNextUserPage) {
            const likeData = await getTweetLikers(tweetId, userCursor);
            if (!likeData || !Array.isArray(likeData.users)) {
              throw new Error("Invalid likers data from API");
            }
            allUsers = allUsers.concat(likeData.users || []);
            hasNextUserPage = likeData.has_next_page || false;
            userCursor = retweetData.next_cursor || "";
          }
        }

        success = allUsers.some(
          (user) => user.username.toLowerCase() === userCredentials.twitterUsername.toLowerCase()
        );
        message = success
          ? `${task.taskType} verified`
          : `Please ${task.taskType.toLowerCase()} to complete this task`;
        break;

      case "Join Discord":
        success = true; // Placeholder
        message = "Discord join verified";
        break;

      case "Visit Website":
        success = true; // Placeholder
        message = "Website visit verified";
        break;

      default:
        success = false;
        message = "Unsupported task type";
    }

    return { success, message };
  } catch (error: any) {
    console.error("fetchTaskHandler error:", {
      taskType: task.taskType,
      link: task.link,
      errorMessage: error.message,
      stack: error.stack,
    });
    return { success: false, message: `Verification failed: ${error.message}` };
  }
}

export async function updateUserProgress(
  questId: string,
  userId: string,
  walletAddress: string,
  task: { taskType: string; link: string; points: number; index?: number }
) {
  try {
    const userProgressRef = doc(db, "quests", questId, "userProgress", userId);
    await setDoc(
      userProgressRef,
      {
        tasksCompleted: arrayUnion({
          taskIndex: task.index,
          proof: task.link,
          awardedPoints: task.points,
          completedAt: new Date().toISOString(),
        }),
        pointsCollected: increment(task.points),
        walletAddress: walletAddress,
        status: "pending",
      },
      { merge: true }
    );

    const response = await fetch("/api/add-eligible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questId,
        address: walletAddress,
        amount: task.points,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add to eligible pool");
    }

    return { success: true, message: "Progress updated and eligibility recorded" };
  } catch (error: any) {
    console.error("Error updating user progress:", error);
    return { success: false, message: `Failed to update progress: ${error.message}` };
  }
}