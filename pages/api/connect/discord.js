import { withIronSession } from 'next-iron-session';

const discordOAuth = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `https://surabaya-blockchain-alliance-sand.vercel.app/api/connect/discord/callback`, // Use env variable
};

const discordHandler = async (req, res) => {
  try {
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${discordOAuth.clientId}&redirect_uri=${encodeURIComponent(discordOAuth.redirectUri)}&response_type=code&scope=identify`;
    res.redirect(discordAuthUrl);
  } catch (error) {
    console.error('Error initiating Discord auth:', error);
    res.status(500).json({ error: 'Failed to initiate Discord authentication' });
  }
};

export default withIronSession(discordHandler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'discord_oauth',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
});