import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth'; 
import Link from 'next/link';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import EventCard from '@/components/card/events';
import { auth } from '../config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true); 
  const [userData, setUserData] = useState({
    username: '',
    twitter: null,
    discord: null,
    telegram: null,
    walletAddress: null,
    pointsCollected: 0,
    profilePicture: null,
  });
  const [loading, setLoading] = useState(true);
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
    const fetchProfile = async () => {
      const storedUid = localStorage.getItem('uid');
      if (!storedUid) {
        console.error('UID not found');
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/get-profile?uid=${storedUid}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserData({
            username: data.username || 'Not set',
            twitter: data.twitterUsername || null,
            discord: data.discordUsername || null,
            telegram: data.telegram || null,
            walletAddress: data.walletAddress || null,
            pointsCollected: data.points || 0,
            profilePicture: data.profilePicture || null,
          });
        } else {
          console.error('Failed to fetch profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      .sticky-card {
        position: sticky;
        top: 10px;
        max-height: 80vh;
        overflow-y: auto;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('uid');
      localStorage.removeItem('user');
      router.push('/'); 
    } catch (error) {
      console.error('Error during Firebase logout:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  if (checkingAuth || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar /> {/* ✅ Navbar added */}

      <main className="flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-4">
          {/* Left Column: Profile */}
          <div className="bg-white w-full max-w-xl shadow-2xl py-5 px-10">
            <div className="flex justify-between items-center">
              <LogoIcon />
              <Link href="/" className="text-sm text-black">Go to Dashboard</Link>
            </div>

            <div className="pt-16 pb-5">
              <p className="text-2xl font-bold">Profile</p>
              <p className="text-sm font-medium">Welcome back, {userData.username}!</p>

              {userData.profilePicture && (
                <div className="mt-4">
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="rounded-full w-24 h-24 object-cover border"
                  />
                </div>
              )}

              <div className="flex justify-between mt-4">
                <p className="font-semibold">Points Collected:</p>
                <p className="text-green-600">{userData.pointsCollected} Points</p>
              </div>
            </div>

            <div className="py-4 space-y-2">
              <div className="flex justify-between">
                <p className="font-semibold">Twitter:</p>
                <p className="text-blue-500">{userData.twitter ? `@${userData.twitter}` : 'Not connected'}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Discord:</p>
                <p className="text-gray-700">{userData.discord || 'Not connected'}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Telegram:</p>
                <p className="text-gray-700">{userData.telegram || 'Not connected'}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Wallet Address:</p>
                <p className="text-gray-700">
                  {userData.walletAddress
                    ? `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`
                    : 'Not connected'}
                </p>
              </div>
            </div>

            <div className="py-3 space-y-2">
              <button
                onClick={() => router.push('/setup')}
                className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md"
              >
                Edit Profile
              </button>
              <button
                className="btn w-full bg-red-600 text-white hover:bg-red-700 shadow-xl rounded-md"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Right Column: Events */}
          <div className="bg-white shadow-xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <EventCard />
          </div>
        </div>
      </main>

      <Footer /> 
    </div>
  );
}
