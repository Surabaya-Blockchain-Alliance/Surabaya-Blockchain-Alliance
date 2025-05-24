import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/config";
import { Lucid, Blockfrost } from "lucid-cardano";
import { arrayUnion, increment } from "firebase/firestore";
import { initSync } from "lucid-cardano";
import * as wasm from "cardano-multiplatform-lib-nodejs";
import axios from "axios";

const TWITTER_API_IO_KEY = "21d9ac51d9f94d19a4c04e4a2336b233"; 
const TWITTER_API_IO_URL = "https://api.twitterapi.io/twitter/user/followings";

async function getUserFollowings(username, cursor = "") {
  try {
    const response = await axios.get(TWITTER_API_IO_URL, {
      headers: { "X-API-Key": TWITTER_API_IO_KEY },
      params: { userName: username, cursor },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user followings from twitterapi.io:", error.response?.data || error.message);
    throw new Error(`Failed to fetch followings: ${error.message}`);
  }
}

export async function fetchTaskHandler(
  questId: string,
  userId: string,
  walletAddress: string,
  task: { taskType: string; link: string; points: number },
  userCredentials: { twitterId?: string; discordId?: string; twitterUsername?: string }
) {
  try {
    // Initialize WASM
    initSync(wasm);

    let success = false;
    let message = "";

    switch (task.taskType) {
      case "Follow Twitter":
        if (!userCredentials.twitterUsername) {
          throw new Error("Twitter username not provided in userCredentials");
        }

        const twitterIds = JSON.parse(task.link);
        const targetUsernames = Object.keys(twitterIds).map(u => u.toLowerCase());

        let allFollowings = [];
        let cursor = "";
        let hasNextPage = true;
        while (hasNextPage) {
          const data = await getUserFollowings(userCredentials.twitterUsername, cursor);
          allFollowings = allFollowings.concat(data.followings || []);
          hasNextPage = data.has_next_page;
          cursor = data.next_cursor || "";
        }
        success = allFollowings.some(user => 
          targetUsernames.includes(user.username.toLowerCase())
        );
        message = success ? "Twitter follow verified" : "Twitter follow not verified";
        break;

      case "Own NFT":
        const lucid = await Lucid.new(
          new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", process.env.BLOCKFROST_API_KEY),
          "Testnet"
        );
        const utxos = await lucid.utxosAt(walletAddress);
        success = utxos.some((utxo) => utxo.assets[task.link] > 0);
        message = success ? "NFT ownership verified" : "NFT not found in wallet";
        break;

      case "Join Discord":
        success = true; // Placeholder: Implement Discord API check
        message = "Discord join verified";
        break;

      case "Retweet Tweet":
      case "Like Tweet":
        const tweetId = task.link.match(/status\/(\d+)/)?.[1];
        if (tweetId) {
          const endpoint = task.taskType === "Retweet Tweet" ? "retweets" : "likes";
          const res = await fetch(
            `https://api.twitter.com/2/tweets/${tweetId}/${endpoint}`,
            {
              headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
            }
          );
          const tweetData = await res.json();
          success = tweetData.data?.some((user: any) => user.id === userCredentials.twitterId);
          message = success ? `${task.taskType} verified` : `${task.taskType} not verified`;
        } else {
          success = false;
          message = "Invalid tweet URL";
        }
        break;

      case "Visit Website":
        success = true; // Placeholder: Implement signed message or API check
        message = "Website visit verified";
        break;

      case "Attend Event":
        const lucidEvent = await Lucid.new(
          new Blockfrost("https://cardano-testnet.blockfrost.io/api/v0", process.env.BLOCKFROST_API_KEY),
          "Testnet"
        );
        const utxosEvent = await lucidEvent.utxosAt(walletAddress);
        success = utxosEvent.some((utxo) => utxo.assets[task.link] > 0);
        message = success ? "Event attendance verified" : "Attendance NFT not found";
        break;

      default:
        success = false;
        message = "Unsupported task type";
    }

    if (success) {
      // Update Firestore
      const userProgressRef = doc(db, "quests", questId, "userProgress", userId);
      await updateDoc(userProgressRef, {
        completedTasks: arrayUnion({
          taskIndex: task.index,
          proof: task.link,
          awardedPoints: task.points,
          completedAt: new Date().toISOString(),
        }),
        totalPoints: increment(task.points),
        userWallet: walletAddress,
        status: "pending",
      });

      // Add to reward pool
      const questRef = doc(db, "quests", questId);
      const questSnap = await getDoc(questRef);
      const questData = questSnap.data();
      await fetch("/api/add-eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId,
          address: walletAddress,
          amount: task.points,
        }),
      });
    }

    return { success, message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}