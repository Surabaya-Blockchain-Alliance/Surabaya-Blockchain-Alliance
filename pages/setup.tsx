import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ConnectWallet from '../components/button/ConnectWallet';
import SocialIcon from '@/components/SocialIcon';
import { FaXTwitter } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { BsCheck2Circle } from 'react-icons/bs';
import { auth, db, setDoc, doc } from '../config';

export default function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/signin');
      } else {
        setUser(firebaseUser);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const checkConnections = async () => {
      try {
        const twitterRes = await fetch('/api/get/twitter-status', { method: 'GET', credentials: 'include' });
        if (twitterRes.ok) {
          const twitterData = await twitterRes.json();
          setTwitterConnected(twitterData.connected);
          if (twitterData.username) {
            setTwitterUsername(twitterData.username);
            setUsername(twitterData.username);
          }
        }

        const discordRes = await fetch('/api/get/discord-username', { method: 'GET', credentials: 'include' });
        if (discordRes.ok) {
          const discordData = await discordRes.json();
          setDiscordUsername(discordData.username);
          if (discordData.username && !twitterUsername) {
            setUsername(discordData.username);
          }
        }
      } catch (err) {
        console.error('Error checking social connections:', err);
      }
    };

    checkConnections();
  }, [user, twitterUsername]);

  const handleConnectTwitter = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/connect/twitter', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      alert(`Failed to connect with Twitter: ${err.message}`);
      setLoading(false);
    }
  };

  const handleConnectDiscord = () => {
    window.location.href = '/api/connect/discord';
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const handleProfileSave = async () => {
    try {
      if (!user) {
        alert('You must be logged in to save your profile!');
        return;
      }

      setLoading(true);
      const profileData = {
        username,
        twitterUsername: twitterConnected ? twitterUsername : null,
        discordUsername: discordUsername || null,
        walletAddress: walletAddress || null,
        profileImage,
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      router.push('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
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
    return () => document.head.removeChild(styleSheet);
  }, []);

  const bgImage =
    'data:image/png;base64,iVBOR...'; // truncated for brevity
  const currentYear = new Date().getFullYear();

  // 🔒 While checking auth or redirecting, show nothing
  if (checkingAuth) {
    return <div className="h-screen w-full flex justify-center items-center text-lg">Checking authentication...</div>;
  }

  // 🧑 Full setup UI for logged-in users
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen text-gray-800">
        <div className="flex justify-between items-start gap-5"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            background: `url(${bgImage}) repeat 0 0`,
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}>
          <div className="bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10 overflow-y-auto" style={{ maxHeight: '100vh' }}>
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">Complete your profile</h1>
              <p className="text-sm font-medium">Fill in your details below</p>
            </div>

            <div className="py-4 text-center">
              <label className="text-black text-sm">Profile Image</label>
              <div className="flex justify-center mt-3">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <input type="file" onChange={handleImageChange} accept="image/*" className="mt-2 text-center" />
            </div>

            <div className="py-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text text-black">Username</span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  className="input bg-transparent input-bordered w-full"
                />
              </label>
            </div>

            <div className="space-y-4 mt-4">
              <button
                className="btn w-full bg-gray-500 text-white shadow-xl flex justify-between"
                onClick={handleConnectTwitter}
                disabled={loading}
              >
                <span>{twitterUsername ? `@${twitterUsername}` : 'Connect Twitter'}</span>
                <FaXTwitter />
              </button>

              <button
                className="btn w-full bg-[#5865F2] text-white shadow-xl flex justify-between"
                onClick={handleConnectDiscord}
                disabled={loading}
              >
                <span>{discordUsername || 'Connect Discord'}</span>
                <FaDiscord />
              </button>

              <ConnectWallet onConnect={handleWalletConnect} />
            </div>

            <div className="py-3">
              <button
                className="btn w-full bg-black text-white hover:bg-gray-800"
                onClick={handleProfileSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
                <BsCheck2Circle className="text-lg ml-2" />
              </button>
            </div>

            <footer className="footer bg-white text-black items-center px-10 py-4 border-t mt-4">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" width={46} />
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
              <span className="text-blue-800">Cardano Hub</span> <span className="text-red-600">Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/36fcbde8-8edd-4016-ba3e-30b30b4cee21/pLkaTa0nFX.lottie"
              loop
              autoplay
            />
            <p className="text-lg font-medium">Start engaging users and communities!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
