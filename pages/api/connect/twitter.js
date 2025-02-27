import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { withIronSession } from 'next-iron-session';

const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_API_KEY,
    secret: process.env.TWITTER_API_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const callbackUrl = `http://localhost:3000/api/connect/twitter/callback`; // Use env var for flexibility
  const requestData = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST',
    data: { oauth_callback: callbackUrl },
  };

  try {
    const headers = oauth.toHeader(oauth.authorize(requestData));
    const response = await axios.post(
      requestData.url,
      new URLSearchParams({ oauth_callback: callbackUrl }),
      { headers }
    );

    const params = new URLSearchParams(response.data);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    if (!oauthToken || !oauthTokenSecret) {
      throw new Error('Failed to retrieve OAuth tokens from Twitter');
    }

    // Store tokens in session
    req.session.set('oauth', { token: oauthToken, tokenSecret: oauthTokenSecret });
    await req.session.save();

    console.log('Session saved:', req.session.get('oauth')); // Debug session

    const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Error in Twitter auth initiation:', error.message);
    return res.status(500).json({ error: 'Failed to initiate Twitter authentication', details: error.message });
  }
};

export default withIronSession(handler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'twitter_oauth',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true,
    sameSite: 'lax',
  },
});