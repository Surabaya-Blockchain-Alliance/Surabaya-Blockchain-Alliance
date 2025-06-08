import { withIronSession } from 'next-iron-session';

const handler = async (req, res) => {
  const discordSession = req.session.get('discord') || {};
  console.log('Discord session in /api/get/discord-username:', discordSession); // Debug

  if (discordSession.username) {
    return res.status(200).json({
        true,
      username: discordSession.username,
    });
  }

  return res.status(200).json({
      false,
    username: null,
  });
};

export default withIronSession(handler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'discord_oauth',
  cookieOptions: {
    secure: process.env.NODE_ENV,
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
});