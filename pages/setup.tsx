import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { connect } from '../auth';
import ConnectWallet from '../components/button/ConnectWallet';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';

export default function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const twitterResponse = await fetch('/get/twitter-status', {
          method: 'GET',
          credentials: 'include',
        });
        const twitterData = await twitterResponse.json();
        setTwitterConnected(twitterData.connected);
        setTwitterUsername(twitterData.username);

        const discordResponse = await fetch('/get/discord-username', {
          method: 'GET',
          credentials: 'include',
        });
        const discordData = await discordResponse.json();
        setDiscordUsername(discordData.username);
      } catch (error) {
        console.error('Error checking connections:', error);
      }
    };

    checkConnections();
  }, []);

  const handleConnectTwitter = async () => {
    try {
      setLoading(true);
      const response = await fetch('/connect/twitter', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Twitter authentication');
      }

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authentication URL received');
      }
    } catch (error) {
      console.error('Twitter connection error:', error);
      alert(`Failed to connect with Twitter: ${error.message}`);
      setLoading(false);
    }
  };

  const handleConnectDiscord = () => {
    window.location.href = '/connect/discord';
  };

  const handleConnectTelegram = async () => {
    try {
      setLoading(true);
      const response = await fetch('/connect/telegram', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Telegram connection error:', error);
      alert(`Failed to connect with Telegram: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, twitterUsername, discordUsername }),
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        alert('Profile saved successfully');
        router.push('/profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="container">
        <h1>Profile Setup</h1>
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <SocialIcon
            onClick={handleConnectTwitter}
            icon="twitter"
            connected={twitterConnected}
            username={twitterUsername}
          />
          <SocialIcon
            onClick={handleConnectDiscord}
            icon="discord"
            connected={!!discordUsername}
            username={discordUsername}
          />
        </div>
        <div>
          <button onClick={handleSaveProfile} disabled={loading}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}
