import { withIronSession } from 'next-iron-session';

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'user_profile',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 1, // 1 days
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    req.session.destroy();
    res.setHeader('Set-Cookie', [
      `user_profile=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; ${
        process.env.NODE_ENV === 'production' ? 'Secure;' : ''
      }`,
    ]);

    console.log('✅ Session destroyed and cookie cleared');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({ error: 'Failed to log out' });
  }
}

export default withIronSession(handler, sessionOptions);
