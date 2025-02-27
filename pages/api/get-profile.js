import { withIronSession } from 'next-iron-session';

const handler = async (req, res) => {
  const profile = req.session.get('profile') || {
    username: '',
    twitterUsername: null,
    discordUsername: null,
    walletAddress: null,
    telegram: null, // Placeholder for future use
    pointsCollected: 0, // Placeholder for future use
  };

  return res.status(200).json(profile);
};

export default withIronSession(handler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'user_profile',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30 * 1000, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  },
});