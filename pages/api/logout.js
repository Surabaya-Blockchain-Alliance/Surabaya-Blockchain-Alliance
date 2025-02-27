import { withIronSession } from 'next-iron-session';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    req.session.destroy();
    console.log('Session cleared'); // Debug
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ error: 'Failed to log out' });
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