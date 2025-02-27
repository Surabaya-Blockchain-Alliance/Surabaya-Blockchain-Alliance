import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ConnectWallet from '../components/button/ConnectWallet';
import SocialIcon from '@/components/SocialIcon';
import { FaXTwitter } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { BsCheck2Circle } from 'react-icons/bs';

export default function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();

  // useEffect(() => {
  //   const checkConnections = async () => {
  //     try {
  //       const twitterResponse = await fetch('https://surabaya-blockchain-alliance-sand.vercel.app/api/get/twitter-status', {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
  //       if (twitterResponse.ok) {
  //         const twitterData = await twitterResponse.json();
  //         setTwitterConnected(twitterData.connected);
  //         if (twitterData.username) {
  //           setTwitterUsername(twitterData.username);
  //           setUsername(twitterData.username);
  //         }
  //       }

  //       const discordResponse = await fetch('https://surabaya-blockchain-alliance-sand.vercel.app/api/get/discord-username', {
  //         method: 'GET',
  //         credentials: 'include',
  //       });
  //       if (discordResponse.ok) {
  //         const discordData = await discordResponse.json();
  //         setDiscordUsername(discordData.username);
  //         if (discordData.username && !twitterUsername) {
  //           setUsername(discordData.username);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error checking connections:', error);
  //     }
  //   };

  //   checkConnections();
  // }, []);

  const handleConnectTwitter = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/connect/twitter', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Twitter authentication');
      }

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Twitter connection error:', error);
      alert(`Failed to connect with Twitter: ${error.message}`);
      setLoading(false);
    }
  };

  const handleConnectDiscord = async () => {
    window.location.href = 'https://surabaya-blockchain-alliance-sand.vercel.app/api/connect/discord';
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    console.log('Wallet address received in ProfileSetup:', address); // Debug
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const profileData = {
        username,
        twitterUsername: twitterConnected ? twitterUsername : null,
        discordUsername: discordUsername || null,
        walletAddress: walletAddress || null,
      };

      console.log('Profile data being sent:', profileData); // Debug

      const response = await fetch('https://surabaya-blockchain-alliance-sand.vercel.app/api/save-profile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile save failed');
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


  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen text-gray-800">
        <div className="flex justify-between items-start gap-5"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url(${bgImage}) repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}>
          <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="" className="h-full" width={200} />
            </div>
            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold text-gray-900">Completed your profiles!</h1>
              <p className="text-sm font-medium text-gray-700">Fill in your details</p>
            </div>
            <div className="py-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text text-black">Username</span>
                </div>
                <input
                  type="text" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username" id='username'
                  className="input bg-transparent input-bordered w-full" />
              </label>

            </div>
            <div className="space-y-4 mt-4">
              <button
                className="btn w-full bg-black shadow-xl text-white space-x-2 flex justify-between hover:text-black hover:bg-white"
                onClick={handleConnectTwitter}
                disabled={loading || twitterConnected}
              >
                <span>{twitterUsername ? `@${twitterUsername}` : 'Connect Twitter'}</span>
                <FaXTwitter />
              </button>

              <button
                className="btn w-full bg-[#5865F2] border-[#5865F2] shadow-xl text-white space-x-2 flex justify-between hover:text-[#5865F2] hover:bg-white hover:border-[#5865F2]"
                onClick={handleConnectDiscord}
                disabled={loading}
              >
                <span>{discordUsername ? `${discordUsername}` : 'Connect Discord'}</span>
                <FaDiscord />
              </button>

              <ConnectWallet onConnect={handleWalletConnect} />
            </div>
            <div className="py-3">
              <button
                className="btn w-full bg-black shadow-xl text-white hover:bg-gray-800"
                onClick={handleProfileSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
                <BsCheck2Circle className="text-lg" />
              </button>
            </div>

            <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" className="h-full" width={46} />
                <p>Copyright © {currentYear} - All rights reserved</p>
              </aside>
              <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                <SocialIcon href={process.env.URL_TWITTER} type="twitter" />
                <SocialIcon href={process.env.URL_DISCORD} type="discord" />
                <SocialIcon href={process.env.URL_TELEGRAM} type="telegram" />
              </nav>
            </footer>
          </div>

          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
            <span className='text-blue-800'>Cardano Hub</span> <span className='text-red-600'>Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/36fcbde8-8edd-4016-ba3e-30b30b4cee21/pLkaTa0nFX.lottie"
              loop
              autoplay
            />
            <p className="text-lg font-medium">Start engage users and communities!</p>

          </div>
        </div>
      </div>
    </div>
  );
}
