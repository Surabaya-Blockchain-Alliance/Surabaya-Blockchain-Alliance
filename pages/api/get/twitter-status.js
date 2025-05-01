import { withIronSession } from 'next-iron-session';

const handler = async (req, res) => {
  const twitterSession = req.session.get('twitter') || {};

  if (twitterSession.username) {
    return res.status(200).json({
      connected: true,
      username: twitterSession.username,
    });
  }

  return res.status(200).json({
    connected: false,
    username: null,
  });
};

export default withIronSession(handler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'twitter_oauth',
  cookieOptions: {
    secure: process.env.NODE_ENV,
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
});