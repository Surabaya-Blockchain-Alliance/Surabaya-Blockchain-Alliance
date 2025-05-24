import axios from "axios";

const TWITTER_API_IO_KEY = process.env.TWITTER_API_IO_KEY as string;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;

const twitterClient = axios.create({
  baseURL: "https://api.twitterapi.io/twitter",
  headers: { "X-API-Key": TWITTER_API_IO_KEY },
});

const discordClient = axios.create({
  baseURL: "https://discord.com/api",
  headers: {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const visitedLinks = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    type,
    username,
    target,
    tweetId,
    discordUserId,
    guildId,
    roleId,
    userId,
    link,
  } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Missing 'type' field" });
  }

  try {
    if (type === "follow twitter") {
      if (!username || !target) {
        return res.status(400).json({ error: "Missing username or target for follow task" });
      }
      const response = await twitterClient.get("/user/check_follow_relationship", {
        params: {
          source_user_name: username,
          target_user_name: target,
        },
      });

      const data = response.data.data;
      const verified = data.following === true;
      return res.status(200).json({
        verified,
        message: verified
          ? "User is following the target account."
          : "User is not following the target account.",
        data,
      });
    }

    if (type === "retweet" || type === "like") {
      if (!username || !tweetId) {
        return res.status(400).json({ error: "Missing username or tweetId for retweet/like task" });
      }

      const endpoint = type === "retweet" ? "retweeters" : "likers";

      let verified = false;
      let cursor = "";
      let hasNext = true;

      while (hasNext) {
        const response = await twitterClient.get(`/tweet/${endpoint}`, {
          params: { tweetId, cursor },
        });

        const users = response.data?.users || [];
        verified = users.some(
          (user) => user.username.toLowerCase() === username.toLowerCase()
        );

        hasNext = response.data?.has_next_page || false;
        cursor = response.data?.next_cursor || "";

        if (verified) break;
      }

      return res.status(200).json({
        verified,
        message: verified
          ? `User has ${type}d the tweet.`
          : `User has not ${type}d the tweet.`,
      });
    }

    if (type === "join_discord") {
      if (!discordUserId || !guildId || !roleId) {
        return res.status(400).json({ error: "Missing discordUserId, guildId or roleId for Discord verification" });
      }

      try {
        const response = await discordClient.get(`/guilds/${guildId}/members/${discordUserId}`);
        const member = response.data;

        if (!member) {
          return res.status(200).json({
            verified: false,
            message: "User is not a member of the specified Discord guild.",
          });
        }

        const hasRole = member.roles.includes(roleId);

        return res.status(200).json({
          verified: hasRole,
          message: hasRole
            ? "User is a member of the Discord guild and has the specified role."
            : "User is a member of the Discord guild but does NOT have the specified role.",
        });
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return res.status(200).json({
            verified: false,
            message: "User is not a member of the specified Discord guild.",
          });
        }
        console.error("Discord verification error:", error.message);
        return res.status(500).json({ error: "Discord verification error: " + error.message });
      }
    }

    if (type === "visit_link") {
      if (!userId || !link) {
        return res.status(400).json({ error: "Missing userId or link for visit_link task" });
      }
      if (!visitedLinks[userId]) {
        visitedLinks[userId] = new Set();
      }
      visitedLinks[userId].add(link);

      return res.status(200).json({
        verified: true,
        message: `Recorded that user ${userId} visited link ${link}`,
      });
    }

    if (type === "check_visit_link") {
      if (!userId || !link) {
        return res.status(400).json({ error: "Missing userId or link for check_visit_link task" });
      }
      const hasVisited = visitedLinks[userId]?.has(link) || false;

      return res.status(200).json({
        verified: hasVisited,
        message: hasVisited
          ? `User ${userId} has visited link ${link}.`
          : `User ${userId} has NOT visited link ${link}.`,
      });
    }

    return res.status(400).json({ error: "Unsupported task type" });
  } catch (error) {
    console.error("Verification error:", error.message);
    return res.status(500).json({ error: "Verification error: " + error.message });
  }
}
