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
  const { oauth_token, oauth_verifier } = req.query;

  // Validate query parameters
  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: 'Missing oauth_token or oauth_verifier in callback' });
  }

  // Check session
  const oauthSession = req.session.get('oauth');
  console.log('Session in callback:', oauthSession); // Debug session

  if (!oauthSession || !oauthSession.tokenSecret) {
    return res.status(400).json({ error: 'Session expired or invalid. Please restart the authentication process.' });
  }

  // Verify token match
  if (oauthSession.token !== oauth_token) {
    return res.status(400).json({ error: 'OAuth token mismatch between session and callback' });
  }

  const requestData = {
    url: 'https://api.twitter.com/oauth/access_token',
    method: 'POST',
    data: { oauth_verifier },
  };

  const token = {
    key: oauth_token,
    secret: oauthSession.tokenSecret,
  };

  try {
    const headers = oauth.toHeader(oauth.authorize(requestData, token));
    const response = await axios.post(
      requestData.url,
      new URLSearchParams({ oauth_verifier }),
      { headers }
    );

    const params = new URLSearchParams(response.data);
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const screenName = params.get('screen_name');
    const userId = params.get('user_id');

    if (!accessToken || !accessTokenSecret) {
      throw new Error('Failed to retrieve access tokens from Twitter');
    }

    // Store Twitter credentials in session
    req.session.set('twitter', {
      accessToken,
      accessTokenSecret,
      username: screenName,
      userId,
    });
    req.session.unset('oauth'); // Clear OAuth temp data
    await req.session.save();

    console.log('Twitter session saved:', req.session.get('twitter')); // Debug

    return res.redirect('/setup'); // Redirect to your desired page
  } catch (error) {
    console.error('Error in Twitter callback:', error.message);
    return res.status(500).json({ error: 'Failed to complete Twitter authentication', details: error.message });
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