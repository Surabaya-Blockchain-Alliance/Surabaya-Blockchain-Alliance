import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || "";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || "";

interface Task {
  taskType: string;
  link: string;
  points: number;
}

interface VerificationResult {
  success: boolean;
  message: string;
}

interface UsernameToIdMap {
  [username: string]: string;
}

const twitterClient = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
});

const discordClient = axios.create({
  baseURL: "https://discord.com/api",
  headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
});

const blockfrostClient = axios.create({
  baseURL: "https://cardano-mainnet.blockfrost.io/api/v0",
  headers: { project_id: BLOCKFROST_API_KEY },
});

export const fetchTaskHandler = async (
  questId: string,
  userId: string,
  walletAddress: string,
  task: Task,
  userCredentials?: { twitterId?: string; discordId?: string }
): Promise<VerificationResult> => {
  try {
    switch (task.taskType) {
      case "Follow Twitter":
        return await verifyTwitterFollow(userCredentials?.twitterId, task.link);
      case "Join Discord":
        return await verifyDiscordJoin(userCredentials?.discordId, task.link);
      case "Retweet Tweet":
        return await verifyTwitterRetweet(userCredentials?.twitterId, task.link);
      case "Like Tweet":
        return await verifyTwitterLike(userCredentials?.twitterId, task.link);
      case "Visit Website":
        return await verifyWebsiteVisit(walletAddress, task.link);
      case "Own NFT":
        return await verifyNFTOwnership(walletAddress, task.link);
      default:
        return { success: false, message: `Unsupported task type: ${task.taskType}` };
    }
  } catch (error: any) {
    console.error(`Task verification failed (${task.taskType}):`, error);
    return { success: false, message: `Verification failed: ${error.message}` };
  }
};

async function verifyTwitterFollow(twitterId: string | undefined, link: string): Promise<VerificationResult> {
  if (!twitterId) {
    return { success: false, message: "Twitter ID not provided. Please connect your Twitter account." };
  }
  if (!TWITTER_BEARER_TOKEN) {
    return { success: false, message: "Twitter API credentials missing." };
  }

  try {
    let usernameToIdMap: UsernameToIdMap;
    try {
      usernameToIdMap = JSON.parse(link);
    } catch {
      return { success: false, message: "Invalid task link format. Expected JSON { username: id }." };
    }

    const followResponse = await twitterClient.get(`/users/${twitterId}/following`);
    const followedIds = followResponse.data.data.map((user: any) => user.id);
    const missingFollows: string[] = [];
    for (const [username, id] of Object.entries(usernameToIdMap)) {
      if (id && !followedIds.includes(id)) {
        missingFollows.push(username);
      }
    }

    if (missingFollows.length === 0) {
      return { success: true, message: "User follows all required accounts." };
    } else {
      return {
        success: false,
        message: `User does not follow: ${missingFollows.map((u) => `@${u}`).join(", ")}.`,
      };
    }
  } catch (error: any) {
    return { success: false, message: `Twitter follow check failed: ${error.message}` };
  }
};

async function verifyTwitterRetweet(twitterId: string | undefined, link: string): Promise<VerificationResult> {
  if (!twitterId) {
    return { success: false, message: "Twitter ID not provided. Please connect your Twitter account." };
  }
  if (!TWITTER_BEARER_TOKEN) {
    return { success: false, message: "Twitter API credentials missing." };
  }

  try {
    const tweetId = link.match(/status\/(\d+)/)?.[1];
    if (!tweetId) {
      return { success: false, message: "Invalid tweet URL." };
    }

    const retweetResponse = await twitterClient.get(`/tweets/${tweetId}/retweeted_by`);
    const retweeters = retweetResponse.data.data.some((user: any) => user.id === twitterId);

    return retweeters
      ? { success: true, message: `User has retweeted the tweet.` }
      : { success: false, message: `User has not retweeted the tweet.` };
  } catch (error: any) {
    return { success: false, message: `Twitter retweet check failed: ${error.message}` };
  }
};

async function verifyTwitterLike(twitterId: string | undefined, link: string): Promise<VerificationResult> {
  if (!twitterId) {
    return { success: false, message: "Twitter ID not provided. Please connect your Twitter account." };
  }
  if (!TWITTER_BEARER_TOKEN) {
    return { success: false, message: "Twitter API credentials missing." };
  }

  try {
    const tweetId = link.match(/status\/(\d+)/)?.[1];
    if (!tweetId) {
      return { success: false, message: "Invalid tweet URL." };
    }

    const likeResponse = await twitterClient.get(`/tweets/${tweetId}/liking_users`);
    const likers = likeResponse.data.data.some((user: any) => user.id === twitterId);

    return likers
      ? { success: true, message: `User has liked the tweet.` }
      : { success: false, message: `User has not liked the tweet.` };
  } catch (error: any) {
    return { success: false, message: `Twitter like check failed: ${error.message}` };
  }
};

async function verifyDiscordJoin(discordId: string | undefined, link: string): Promise<VerificationResult> {
  if (!discordId) {
    return { success: false, message: "Discord ID not provided. Please connect your Discord account." };
  }
  if (!DISCORD_BOT_TOKEN) {
    return { success: false, message: "Discord API credentials missing." };
  }

  try {
    const guildId = link.match(/\/channels\/(\d+)/)?.[1] || link;
    const memberResponse = await discordClient.get(`/guilds/${guildId}/members/${discordId}`);

    return memberResponse.data
      ? { success: true, message: `User is a member of the Discord server.` }
      : { success: false, message: `User is not a member of the Discord server.` };
  } catch (error: any) {
    return { success: false, message: `Discord join check failed: ${error.message}` };
  }
};

async function verifyWebsiteVisit(walletAddress: string, link: string): Promise<VerificationResult> {
  console.log(`Verifying website visit for wallet ${walletAddress} to ${link}`);
  return { success: true, message: "Website visit verified (mock)." };
};

async function verifyNFTOwnership(walletAddress: string, link: string): Promise<VerificationResult> {
  if (!BLOCKFROST_API_KEY) {
    return { success: false, message: "Blockfrost API key missing." };
  }

  try {
    const policyId = link;
    const assetsResponse = await blockfrostClient.get(`/accounts/${walletAddress}/addresses/assets`);

    const ownsNFT = assetsResponse.data.some((asset: any) => asset.policy_id === policyId);

    return ownsNFT
      ? { success: true, message: `User owns NFT with policy ID ${policyId}.` }
      : { success: false, message: `User does not own NFT with policy ID ${policyId}.` };
  } catch (error: any) {
    return { success: false, message: `NFT ownership check failed: ${error.message}` };
  }
};

export const updateUserProgress = async (
  questId: string,
  userId: string,
  task: Task,
  result: VerificationResult
): Promise<void> => {
  if (!result.success) return;

  try {
    const progressRef = doc(db, "quests", questId, "userProgress", userId);
    await setDoc(
      progressRef,
      {
        tasks: {
          [task.taskType]: {
            completed: true,
            points: task.points,
            verifiedAt: new Date().toISOString(),
          },
        },
      },
      { merge: true }
    );
    console.log(`Progress updated for user ${userId} on quest ${questId}`);
  } catch (error: any) {
    console.error("Error updating user progress:", error);
    throw new Error(`Failed to update progress: ${error.message}`);
  }
};