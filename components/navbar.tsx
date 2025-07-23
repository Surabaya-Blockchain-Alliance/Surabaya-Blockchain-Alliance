import React, { useEffect, useState } from "react";
import "@meshsdk/react/styles.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { BsArrowRight } from "react-icons/bs";
import { auth } from "../config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaArrowAltCircleLeft, FaChevronCircleDown, FaChevronDown, FaUser } from "react-icons/fa";
import LoadingScreen from "./loading-screen";

interface MenuItem {
  label: string;
  href?: string;
  description?: string;
  subMenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Community",
    subMenu: [
      { label: "About", href: "/about", description: "Learn more about our community" },
      { label: "Read Docs", href: "https://comunity-node.gitbook.io/cardanohubindonesia", description: "Find documentation on how to get started" },
      { label: "Article", href: "/blogpost/dashboard", description: "See and create community articles" },
    ],
  },
  {
    label: "Quests",
    subMenu: [
      { label: "View Quests", href: "/quests", description: "Explore available quests" },
      { label: "Create Quest", href: "/Create/quest", description: "Create a new quest" },
    ],
  },
  {
    label: "Events",
    subMenu: [
      { label: "View Events", href: "/events", description: "Browse upcoming events" },
      { label: "Create Event", href: "/Create/event", description: "Create a new event" },
    ],
  },
  { label: "Contact Us", href: "/contact" },
];

const Navbar: React.FC = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: "Guest User",
    twitter: "jhondoe",
    discord: "Jhon Doe",
    telegram: "Jhon Doe",
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    walletAddress: "1FfmbHfnpaZjKFvyi1okTjJJusN455paPH",
    pointsCollected: 0,
    profilePicture: "./img/emblem.png",
    createdAt: new Date(),
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/signin");
      } else {
        setUser(firebaseUser);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUid = localStorage.getItem("uid");
      if (!storedUid) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/get-profile?uid=${storedUid}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        setUserData({
          username: data.username || "Not set",
          twitter: data.twitterUsername || null,
          discord: data.discordUsername || null,
          telegram: data.telegram || null,
          bio: data.bio || null,
          walletAddress: data.walletAddress || null,
          pointsCollected: data.points || 0,
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed.");
    }
  };

  if (checkingAuth || loading) {
    return <LoadingScreen />;
  }

  const renderMenu = (items: MenuItem[], isSubMenu: boolean = false) => {
    return items.map((item, index) => (
      <li key={index}>
        {item.subMenu ? (
          <details>
            <summary className="font-semibold">{item.label}</summary>
            <ul className="p-2 bg-white flex items-center justify-between gap-3 z-50 shadow-lg">
              <div className="cursor-pointer hover:border-gray-200 border-2 border-transparent rounded-2xl transition-all shadow-xl overflow-hidden">
                <Link href={item.subMenu[0].href} className="card image-full h-56 rounded-2xl">
                  <img
                    src="https://t3.ftcdn.net/jpg/07/00/34/62/360_F_700346277_CecN7LvdCIRGdxjwahHa00gqRqAO6CcG.jpg"
                    alt={item.label}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="p-4 w-32 text-left z-50">
                    <span className="font-semibold text-lg text-white">{item.label}</span>
                    <p className="font-normal text-xs text-gray-200 break-words whitespace-normal">
                      {item.label === "Community" ? "Join Our Community!" : `Explore ${item.label}!`}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="space-y-1">
                {renderMenu(item.subMenu, true)}
              </div>
            </ul>
          </details>
        ) : (
          <a href={item.href} className={`block ${!isSubMenu && item.description ? "w-48" : ""} space-y-1`}>
            <span className="font-semibold">{item.label}</span>
            {!isSubMenu && item.description && (
              <p className="text-xs text-gray-500">{item.description}</p>
            )}
          </a>
        )}
      </li>
    ));
  };

  const handleLogin = () => {
    router.push("/signin");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="navbar bg-white rounded-lg shadow-lg">
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <Link href="/" className="btn btn-ghost hover:bg-none rounded-lg">
            <img src="/img/logo.png" alt="Menu Icon" className="w-6 h-6" />
          </Link>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
            {renderMenu(menuItems)}
          </ul>
        </div>
        {/* Brand Name */}
        <Link href="/" className="btn btn-ghost text-black hover:bg-transparent text-xl">
          <img src="/img/logo.png" alt="" className="h-full" />
        </Link>
        <div className="hidden navbar-center lg:flex text-black w-full">
          <ul className="menu menu-horizontal px-1">
            {renderMenu(menuItems)}
          </ul>
        </div>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-3">
        {/* Swap Theme */}
        <label className="swap swap-rotate text-black text-xs">
          <input type="checkbox" />
          {/* Sun icon */}
          <svg className="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>
          {/* Moon icon */}
          <svg className="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>

        {user ? (
          <div className="dropdown dropdown-hover dropdown-end text-black">
            <div tabIndex={0} role="button" className="btn m-1 bg-transparent hover:bg-transparent">
              <span className="pt-1">{userData.username}</span> <FaChevronDown />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
              <li><Link href="/setup"><FaUser /> Profile</Link></li>
              <li><button onClick={handleLogout}><FaArrowAltCircleLeft /> Sign Out</button></li>
            </ul>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            <div className="flex justify-between items-center gap-3">
              <span>Start Your Journey</span>
              <BsArrowRight className="text-xs" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;