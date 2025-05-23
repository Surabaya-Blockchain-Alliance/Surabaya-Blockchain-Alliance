import { withIronSession } from 'next-iron-session';
import axios from 'axios';
const BASE_URL = process.env.BASE_URL;


const discordOAuth = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: `${BASE_URL}/api/connect/discord/callback`,
};

const discordCallbackHandler = async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    console.warn('Discord login canceled or failed:', error || 'Missing code');
    return res.redirect('/setup');
  }

  try {
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: discordOAuth.clientId,
        client_secret: discordOAuth.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: discordOAuth.redirectUri,
        scope: 'identify',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { username, id } = userResponse.data;

    req.session.set('discord', {
      username,
      id,
      accessToken: access_token,
    });
    await req.session.save();

    console.log('Discord session saved:', req.session.get('discord')); // Debug

    res.redirect('/setup');
  } catch (error) {
    console.error('Error in Discord callback:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error connecting to Discord', details: error.message });
  }
};

export default withIronSession(discordCallbackHandler, {
  password: process.env.SESSION_SECRET,
  cookieName: 'discord_oauth',
  cookieOptions: {
    secure: process.env.NODE_ENV,
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  },
});