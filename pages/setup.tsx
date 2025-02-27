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
  const currentUser = connect.twitterAuthUrl;

  useEffect(() => {
    if (!currentUser) {
      router.push('/signin');
    }
  }, [currentUser, router]);

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const twitterResponse = await fetch('https://bakcend-surabaya-blockchain-aliance.vercel.app/get/twitter-status', {
          method: 'GET',
          credentials: 'include',
        });
        if (twitterResponse.ok) {
          const twitterData = await twitterResponse.json();
          setTwitterConnected(twitterData.connected);
          setTwitterUsername(twitterData.username);
        }
        const discordResponse = await fetch('https://bakcend-surabaya-blockchain-aliance.vercel.app/get/discord-username', {
          method: 'GET',
          credentials: 'include',
        });
        if (discordResponse.ok) {
          const discordData = await discordResponse.json();
          setDiscordUsername(discordData.username);
        }
      } catch (error) {
        console.error('Error checking connections:', error);
      }
    };

    if (currentUser) {
      checkConnections();
    }
  }, [currentUser]);

  const handleConnectTwitter = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://bakcend-surabaya-blockchain-aliance.vercel.app/connect/twitter', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
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

  const handleConnectDiscord = async () => {
    window.location.href = 'https://bakcend-surabaya-blockchain-aliance.vercel.app/connect/discord';
  };

  const handleConnectTelegram = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://bakcend-surabaya-blockchain-aliance.vercel.app/connect/telegram', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error('Failed to start Telegram connection');
      }
  
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authentication URL received');
      }
    } catch (error) {
      console.error('Error connecting to Telegram:', error);
      alert('Failed to connect with Telegram: ' + error.message);
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const profileData = {
        username,
        twitterUsername: twitterConnected ? twitterUsername : null,
        discordUsername: discordUsername || null
      };
      
      const response = await fetch('https://bakcend-surabaya-blockchain-aliance.vercel.app/save-profile', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Profile save failed');
      }

      console.log('Profile saved successfully:', profileData);
      router.push('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: 50px 50px; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const bgImage: string = 
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

  return (
    <div className="min-h-screen">
      <div className="w-full h-screen text-gray-800">
        <div
          className="grid grid-cols-2 justify-between items-start gap-10"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url(${bgImage}) repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
            <div className="flex justify-between items-center">
              <LogoIcon />
            </div>
            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h1>
              <p className="text-sm font-medium text-gray-700">Fill in your details</p>
            </div>
            <div className="py-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                value={username || discordUsername || twitterUsername || ''}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
              />
            </div>
            <div className="space-y-4 mt-4">
              <button 
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md" 
                onClick={handleConnectTwitter} 
                disabled={loading || twitterConnected}
              >
                <span>{twitterUsername ? `Connected to @${twitterUsername}` : 'Connect Twitter'}</span>
                <SocialIcon type="twitter" size={24} />
              </button>

              <button 
                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md" 
                onClick={handleConnectDiscord} 
                disabled={loading}
              >
                <span>{discordUsername ? `Connected to ${discordUsername}` : 'Connect Discord'}</span>
                <SocialIcon type="discord" size={24} />
              </button>

              <ConnectWallet />
            </div>
            <div className="py-3">
              <button 
                className="btn w-full bg-black shadow-xl text-white hover:bg-gray-800" 
                onClick={handleProfileSave} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
              <aside className="grid-flow-col items-center">
                <LogoIcon size={24} />
                <p>Copyright © {currentYear} - All rights reserved</p>
              </aside>
              <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <SocialIcon type="twitter" />
                <SocialIcon type="discord" />
                <SocialIcon type="telegram" />
              </nav>
            </footer>
          </div>

          <div className="py-2">
            <h1 className="text-4xl font-semibold">Cardano Hub Indonesia</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
