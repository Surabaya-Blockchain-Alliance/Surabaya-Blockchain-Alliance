import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/config";

const TWITTER_API_IO_KEY = process.env.TWITTER_API_IO_KEY;
if (!TWITTER_API_IO_KEY) {
  console.error("❌ TWITTER_API_IO_KEY is missing. Check your .env file or environment setup.");
}

const twitterApiIoClient = axios.create({
  baseURL: "https://api.twitterapi.io/twitter",
  headers: { "X-API-Key": TWITTER_API_IO_KEY },
});

interface TwitterProfile {
  id: string;
  username: string;
  name: string;
  follower_count?: number;
  following_count?: number;
}

interface UsernameToProfileMap {
  [username: string]: TwitterProfile | null;
}

export const fetchTwitterProfiles = async (usernames: string[]): Promise<UsernameToProfileMap> => {
  if (!TWITTER_API_IO_KEY) {
    throw new Error("TwitterAPI.io API key missing.");
  }

  const result: UsernameToProfileMap = {};
  const cachePath = "cache/twitterProfiles";
  const toFetch: string[] = [];
  const cleanedUsernames = usernames
    .map((u) => u.trim().replace(/^@/, "").toLowerCase())
    .filter((u) => u);

  // Check Firestore cache
  for (const username of cleanedUsernames) {
    const cacheDoc = await getDoc(doc(db, cachePath, username));
    if (cacheDoc.exists()) {
      result[username] = cacheDoc.data() as TwitterProfile;
    } else {
      toFetch.push(username);
    }
  }

  // Fetch profiles from twitterapi.io for uncached usernames
  if (toFetch.length > 0) {
    try {
      for (const username of toFetch) {
        try {
          const response = await twitterApiIoClient.get(`/user/profile`, {
            params: { userName: username },
          });
          const user = response.data;
          if (user && user.id) {
            const profile: TwitterProfile = {
              id: user.id,
              username: user.username.toLowerCase(),
              name: user.name || "",
              follower_count: user.follower_count,
              following_count: user.following_count,
            };
            result[username] = profile;
            // Cache in Firestore
            await setDoc(doc(db, cachePath, username), {
              ...profile,
              cachedAt: new Date().toISOString(),
            });
          } else {
            result[username] = null;
            console.warn(`Username ${username} not found.`);
          }
        } catch (error: any) {
          result[username] = null;
          console.warn(`Failed to fetch profile for ${username}: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error("TwitterAPI.io error:", error.response?.data || error.message);
      throw new Error(`Failed to fetch Twitter profiles: ${error.message}`);
    }
  }

  return result;
};