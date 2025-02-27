import { withIronSession } from 'next-iron-session';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, twitterUsername, discordUsername, walletAddress } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    req.session.set('profile', {
      username,
      twitterUsername,
      discordUsername,
      walletAddress,
    });
    await req.session.save();

    console.log('Profile saved in session:', req.session.get('profile')); // Debug

    return res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving profile:', error);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
}

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