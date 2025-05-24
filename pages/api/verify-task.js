import axios from "axios";
require('dotenv').config(); // Load environment variables

// Environment variables
const TWITTER_API_IO_KEY = process.env.TWITTER_API_IO_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/api/connect/discord/callback";

// Twitter API client
const twitterClient = axios.create({
  baseURL: "https://api.twitterapi.io/twitter",
  headers: { "X-API-Key": TWITTER_API_IO_KEY },
});

// Discord API client (for bot token)
const discordClient = axios.create({
  baseURL: "https://discord.com/api",
  headers: {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Store visited links
const visitedLinks = {};

// Main handler for verification tasks
async function verificationHandler(req, res) {
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
    accessToken, // Added for OAuth2-based Discord verification
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
        return res.status(400).json({ error: "Missing discordUserId, guildId, or roleId for Discord verification" });
      }

      try {
        let response;
        if (accessToken) {
          // OAuth2-based verification
          response = await axios.get(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } else {
          // Bot token-based verification
          response = await discordClient.get(`/guilds/${guildId}/members/${discordUserId}`);
        }

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

// Discord OAuth2 callback handler
async function discordCallbackHandler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Optionally fetch user data
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const discordUserId = userResponse.data.id;

    // Fetch user guilds
    const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const guilds = guildsResponse.data;

    // Store access token securely (e.g., in a database) or return it
    // For simplicity, return it in the response (not recommended for production)
    return res.status(200).json({
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      discordUserId,
      guilds,
      message: "OAuth2 authorization successful. Use accessToken for join_discord verification.",
    });
  } catch (error) {
    console.error("OAuth2 error:", error.message);
    return res.status(500).json({ error: "OAuth2 error: " + error.message });
  }
}

// Export handlers (adjust based on your framework, e.g., Next.js or Express)
export default async function handler(req, res) {
  const path = req.url || req.path;

  if (path.includes("/api/connect/discord/callback")) {
    return discordCallbackHandler(req, res);
  }
  return verificationHandler(req, res);
}