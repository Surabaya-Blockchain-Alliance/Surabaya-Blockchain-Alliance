import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/config";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || "";
if (!TWITTER_BEARER_TOKEN) {
  console.error("❌ TWITTER_BEARER_TOKEN is missing. Check your .env file or environment setup.");
}
const twitterClient = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
});

interface UsernameToIdMap {
  [username: string]: string;
}

export const convertTwitterUsernamesToIds = async (
  usernames: string[]
): Promise<UsernameToIdMap> => {
  if (!TWITTER_BEARER_TOKEN) {
    throw new Error("Twitter API credentials missing.");
  }

  const result: UsernameToIdMap = {};
  const cachePath = "cache/twitterUsernames";
  const toFetch: string[] = [];
  const cleanedUsernames = usernames
    .map((u) => u.trim().replace(/^@/, ""))
    .filter((u) => u); 

  for (const username of cleanedUsernames) {
    const cacheDoc = await getDoc(doc(db, cachePath, username));
    if (cacheDoc.exists()) {
      result[username] = cacheDoc.data().id;
    } else {
      toFetch.push(username);
    }
  }

  if (toFetch.length > 0) {
    try {
      const response = await twitterClient.get(`/users/by?usernames=${toFetch.join(",")}`);
      const users = response.data.data || [];

      for (const user of users) {
        const username = user.username.toLowerCase();
        const id = user.id;
        result[username] = id;
        await setDoc(doc(db, cachePath, username), {
          id,
          username,
          cachedAt: new Date().toISOString(),
        });
      }

      for (const username of toFetch) {
        if (!result[username.toLowerCase()]) {
          result[username.toLowerCase()] = "";
          console.warn(`Username ${username} not found.`);
        }
      }
    } catch (error: any) {
      console.error("Twitter API error:", error);
      throw new Error(`Failed to fetch Twitter IDs: ${error.message}`);
    }
  }

  return result;
};