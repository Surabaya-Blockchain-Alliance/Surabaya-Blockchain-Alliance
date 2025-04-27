import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LogoIcon from '@/components/LogoIcon';
import SocialIcon from '@/components/SocialIcon';
import EventCard from '@/components/card/events';

export default function ProfilePage() {
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
  
    fetchProfile();
  }, []);
  

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
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('Logged out successfully');
        router.push('/');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const currentYear = new Date().getFullYear();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full h-screen text-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10">
            <div className="flex justify-between items-center">
              <LogoIcon />
              <Link href="/" className="text-sm text-black">
                Go to Dashboard
              </Link>
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

            <div className="py-3">
              <button
                className="btn w-full bg-red-600 text-white hover:bg-red-700 shadow-xl rounded-md"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>

            <footer className="footer bg-white text-black items-center sticky bottom-0 top-full mt-6">
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

          <div className="h-screen w-full bg-white shadow-xl p-6">
            <div className="flex flex-col h-full space-y-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <EventCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
