import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ConnectWallet from '../components/button/ConnectWallet';
import SocialIcon from '@/components/social-icon';
import { FaXTwitter } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { BsArrowBarRight, BsArrowDownRightCircle, BsArrowLeftCircle, BsArrowRightCircle, BsCheck2Circle } from 'react-icons/bs';
import { auth, db, setDoc, doc } from '../config';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [discordUsername, setDiscordUsername] = useState(null);
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
  }, [user]);

  const handleProfileSave = async () => {
    if (!walletAddress) {
      alert('Wallet not connected.');
      return;
    }
    try {
      setLoading(true);
      const profileData = {
        uid: user.uid,
        username,
        discordUsername,
        twitterUsername,
        profileImage,
        walletAddress,
      };
      await setDoc(doc(db, 'users', user.uid), profileData);
      router.push('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Unexpected error occurred.');
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

  const handleConnectTwitter = async () => {
    try {
      const res = await fetch('/api/connect/twitter', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      if (data.authUrl) window.location.href = data.authUrl;
    } catch (err) {
      alert(`Failed to connect Twitter: ${err.message}`);
    }
  };

  const handleConnectDiscord = () => {
    window.location.href = '/api/connect/discord';
  };

  const steps = [
    {
      title: 'Upload Avatar',
      content: (
        <div className="space-y-4 pt-10 pb-2 flex justify-center items-start gap-4 w-full">
          <div className="avatar">
            <div className="w-24 h-24 rounded-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <div className="bg-gray-300 w-full h-full flex items-center justify-center text-white">No Image</div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <p className='text-sm'>Please choose your specials avatar 🥳</p>
            <input type="file" onChange={handleImageChange} accept="image/*" className="file-input file-input-sm file-input-bordered" />
          </div>
        </div>
      ),
    },
    {
      title: 'Set Username',
      content: (
        <div className="space-y-4 pt-10 pb-2 flex gap-4 w-full">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="input input-bordered w-full"
          />
        </div>
      ),
    },
    {
      title: 'Connect Social Media',
      content: (
        <div className="space-y-3 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button
              className="btn w-full bg-black text-white flex justify-between items-center px-4 py-3 rounded-lg"
              onClick={handleConnectTwitter}
            >
              <span>{twitterUsername ? `@${twitterUsername}` : 'Connect Twitter'}</span>
              <FaXTwitter />
            </button>
            <button
              className="btn w-full bg-indigo-600 text-white flex justify-between items-center px-4 py-3 rounded-lg"
              onClick={handleConnectDiscord}
            >
              <span>{discordUsername || 'Connect Discord'}</span>
              <FaDiscord />
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Connect Wallet',
      content: (
        <div className="space-y-3 py-5">
          <ConnectWallet onConnect={(address) => setWalletAddress(address)} />,
        </div>
      )
    },
  ];

  if (checkingAuth) return <div className="h-screen flex justify-center items-center text-lg">Checking authentication...</div>;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex p-5 gap-5">
        <div
          className="hidden md:flex max-w-7xl bg-cover bg-center items-center h-screen justify-center text-white rounded-xl"
          style={{ backgroundImage: "url('./img/bg-signin.avif')" }}
        >
          <div className="space-y-4 w-full px-10 text-end">
            <p className="text-sm uppercase tracking-widest">- A Wise Quote -</p>
            <h1 className="text-4xl font-bold leading-10">
              Your journey continues here
            </h1>
            <p className="text-lg font-semibold text-white/80">
              Sign in to unlock new possibilities.
            </p>
          </div>
        </div>


        <div className="flex-1 p-6 bg-white rounded-xl space-y-6">
          {/* Logo */}
          <div className=" p-8 flex justify-center">
            <img src="/img/logo.png" alt="logo" width={160} />
          </div>

          {/* Steps Indicator */}
          <ul className="steps steps-horizontal px-10 w-full">
            {steps.map((s, index) => (
              <li
                key={index}
                className={`step ${index + 1 <= step ? 'step-primary' : ''}`}
                onClick={() => setStep(index + 1)}
              >
                {s.title}
              </li>
            ))}
          </ul>

          {/* Current Step Content */}
          <div className="flex flex-col items-center justify-center py-2">
            <h2 className="text-2xl font-semibold">{steps[step - 1].title}</h2>
            <div className="w-full">{steps[step - 1].content}</div>

            <div
              className={`flex items-center w-full gap-2 py-4 ${step === 1 ? 'justify-end' : 'justify-between'
                }`}
            >
              {step > 1 && (
                <button className="btn" onClick={() => setStep(step - 1)}>
                  <BsArrowLeftCircle className="mr-1" /> Back
                </button>
              )}

              {step < steps.length ? (
                <button
                  className="btn bg-black text-white flex items-center"
                  onClick={() => setStep(step + 1)}
                >
                  Next <BsArrowRightCircle className="ml-1" />
                </button>
              ) : (
                <button
                  className="btn btn-success text-white hover:bg-gray-800 flex items-center"
                  onClick={handleProfileSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-dots loading-sm"></span>
                  ) : (
                    'Save Profile'
                  )}
                  <BsCheck2Circle className="ml-1" />
                </button>
              )}
            </div>

          </div>

          {/* Footer */}
          <footer className="footer bg-white text-black items-center px-10 py-4 border-t sticky bottom-0 top-full">
            <aside className="grid-flow-col items-center">
              <img src="/img/emblem.png" alt="" width={46} />
              <p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
            </aside>
            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
              <SocialIcon href={process.env.URL_TWITTER} type="twitter" />
              <SocialIcon href={process.env.URL_DISCORD} type="discord" />
              <SocialIcon href={process.env.URL_TELEGRAM} type="telegram" />
            </nav>
          </footer>

        </div>
      </div>
    </div>
  );
}
