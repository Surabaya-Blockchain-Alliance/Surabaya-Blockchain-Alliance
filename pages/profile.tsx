import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { Quest } from '@/types/quest';
import { Event } from '@/types/event';
import EventCard from '@/components/card/event';
import QuestCard from '@/components/card/quest';
import Drawer from '@/components/drawer/base';
import { auth, db } from '../config';
import { collection, getDocs } from 'firebase/firestore';
import { FaArrowAltCircleLeft, FaClipboard, FaClone, FaCopy, FaDiscord, FaEllipsisH, FaPenAlt, FaShare } from 'react-icons/fa';
import { FaArrowsSplitUpAndLeft, FaPencil, FaShareFromSquare, FaXTwitter } from 'react-icons/fa6';
import Link from 'next/link';
import UnderlineButton from '@/components/button/underlined';
import LoadingScreen from '@/components/loading-screen';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userData, setUserData] = useState({
    username: 'Guest User',
    twitter: 'jhondoe',
    discord: 'Jhon Doe',
    telegram: 'Jhon Doe',
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    walletAddress: '1FfmbHfnpaZjKFvyi1okTjJJusN455paPH',
    pointsCollected: 0,
    profilePicture: './img/emblem.png',
    createdAt: new Date
  });
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Auth state listener
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

  // Fetch profile info
  useEffect(() => {
    const fetchProfile = async () => {
      const storedUid = localStorage.getItem('uid');
      if (!storedUid) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/get-profile?uid=${storedUid}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        setUserData({
          username: data.username || 'Not set',
          twitter: data.twitterUsername || null,
          discord: data.discordUsername || null,
          telegram: data.telegram || null,
          bio: data.bio || null,
          walletAddress: data.walletAddress || null,
          pointsCollected: data.points || 0,
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt
        });

        console.log("==> user data : " + JSON.stringify(userData))
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Fetch quests and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const questsSnap = await getDocs(collection(db, 'quests'));
        const questsData = questsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Quest[];
        setQuests(questsData);

        const eventsSnap = await getDocs(collection(db, 'events'));
        const eventsData = eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Event[];
        setEvents(eventsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load quests or events.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(userData.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed.');
    }
  };

  const handleEventsClick = (id: string) => {
    router.push(`/join/event/${id}`);
  };

  if (checkingAuth || loading) {
    return <LoadingScreen />;
  }

  const drawerList = [
    {
      label: 'Quest',
      content: <QuestCard quests={quests} />,
    },
    {
      label: 'Events',
      content: events.length ? (
        events.map((event) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-3 w-full">
            <EventCard
              key={event.id}
              title={event.title}
              description={event.description}
              time={event.time}
              timezone={event.timezone}
              joiners={'0'}
              payment={'10 ₳'}
              avatar={event.avatar}
              onClick={() => handleEventsClick(event.id)}
            />
          </div>

        ))
      ) : (
        <div className='flex flex-col justify-center items-center gap-3 py-10 w-full'>
          <p className="text-center col-span-full text-gray-500">No events available at the moment.</p>
          <UnderlineButton
            href="/events"
            label="Join Event Now!"
            textColor="text-black"
            underlineColor="bg-black"
            iconColor="text-black" />
        </div>
      ),
    },
  ];

  return (
    <section className="min-h-screen bg-gray-100 flex flex-col text-black">
      <img src="./img/bg-signup.avif" alt="" className='h-64 bg-cover' />
      <div className="flex-grow w-full">
        <div className="flex gap-10 px-10 bg-slate-100">
          {/* Profile Card */}
          <div className="bg-white w-full max-w-sm flex flex-col justify-start items-center rounded-lg py-5 -mt-20 h-screen px-10">
            {/* Profile Data */}
            <div className="space-y-2 text-center">
              <div className="py-2 flex justify-center">
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="rounded-full w-32 h-32 object-cover border"
                />
              </div>
              <p className="text-2xl font-bold">{userData.username}</p>
              <div className="relative flex justify-center items-center gap-2 text-gray-700">
                <p className="cursor-default">
                  {`${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`}
                </p>
                <div className="relative">
                  <FaClone onClick={handleCopy} className="cursor-pointer hover:text-blue-600" />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
                      Copied
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-700 font-normal text-sm">
                {userData?.bio
                  ? userData.bio.length > 100
                    ? userData.bio.substring(0, 100) + "..."
                    : userData.bio
                  : "No bio available"}
              </p>
            </div>

            {/* Button Points */}
            <div className="py-3 flex justify-center items-center gap-3">
              <button className="btn px-6 bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-700 text-white hover:bg-blue-500 shadow-xl rounded-full">
                🏆 {userData.pointsCollected} Points
              </button>
              <div className="tooltip" data-tip="Share">
                <button className="btn bg-transparent text-gray-700 border border-gray-700 shadow-xl rounded-full">
                  <FaShareFromSquare />
                </button>
              </div>
              <div className="dropdown dropdown-hover dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1 bg-transparent text-gray-700 border border-gray-700 shadow-xl rounded-full">
                  <FaEllipsisH />

                </div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm z-10">
                  <li><Link href={'/setup'}><FaPencil />Update Profile</Link></li>
                  <li><button onClick={handleLogout}> <FaArrowAltCircleLeft /> Sign Out</button></li>
                </ul>
              </div>
            </div>

            {/* Socmed */}
            <div className="py-1 flex">
              <div className="tooltip" data-tip={`@${userData.twitter}`}>
                <button className="btn btn-lg bg-transparent text-gray-400  hover:text-black border-none shadow-none hover:bg-transparent">
                  <FaXTwitter />
                </button>
              </div>
              <div className="tooltip" data-tip={userData.discord}>
                <button className="btn btn-lg bg-transparent text-gray-400 hover:text-indigo-600 border-none shadow-none hover:bg-transparent">
                  <FaDiscord />
                </button>
              </div>
            </div>
            <div className="divider"></div>
            <p className='text-gray-400'>
              Member since at {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
          </div>

          {/* Quests & Events */}
          <div className="space-y-2 w-full py-4 flex justify-start items-start">
            <Drawer
              drawerItems={drawerList}
              classParent='py-1 bg-white bg-opacity-50 rounded-full px-1.5'
              title='Token Assets'
              classActiveTab='pb-0 shadow-xl font-semibold rounded-full bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-700 px-10 text-white pt-1.5'
              classDeactiveTab='pb-0 shadow-xl pt-1.5 font-semibold rounded-full bg-transparent px-10 text-gray-500' align={'start'} />
          </div>
        </div>
      </div>
    </section>
  );
}
