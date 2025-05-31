import React, { useEffect, useState } from "react";
import ButtonBase from "./button/base";
import "@meshsdk/react/styles.css";
import { MeshProvider } from "@meshsdk/react";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoIcon from "./logo-icon";
import { BsArrowRight, BsGear } from "react-icons/bs";
import { auth } from "../config";
import { onAuthStateChanged } from "firebase/auth";

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
      { label: "Article", href: "/blogpost/dashboard", description: "see and create community article" },
    ],
  },
  { label: "Quests", href: "/quests" },
  { label: "Events", href: "/events" },
  { label: "Contact Us", href: "/contact-us" },
];

const Navbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null); // State to track user login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const renderMenu = (items: MenuItem[], isSubMenu: boolean = false) => {
    return items.map((item, index) => (
      <li key={index}>
        {item.subMenu ? (
          <details>
            <summary className="font-semibold">{item.label}</summary>
            <ul className="p-2 bg-white flex items-center justify-between gap-3 z-50">
              <div className="cursor-pointer hover:border-gray-200 border-2 border-transparent rounded-2xl transition-all shadow-xl overflow-hidden">
                <Link href="/community" className="card image-full h-48 rounded-2xl">
                  <img
                    src="https://t3.ftcdn.net/jpg/07/00/34/62/360_F_700346277_CecN7LvdCIRGdxjwahHa00gqRqAO6CcG.jpg"
                    alt="Shoes"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="p-4 w-32 text-left z-50">
                    <span className="font-semibold text-lg text-white">Community</span>
                    <p className="font-normal text-xs text-gray-200 break-words whitespace-normal">
                      Join Our Community!
                    </p>
                  </div>
                </Link>
              </div>
              <div className="space-y-2">
                {renderMenu(item.subMenu)}
              </div>
            </ul>
          </details>
        ) : (
          <a href={item.href} className={`block ${!item.subMenu && item.description ? 'w-48' : ''} space-y-1`}>
            <span className="font-semibold">{item.label}</span>
            {!item.subMenu && item.description && (
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
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost hover:bg-none rounded-lg"
          >
            <img
              src="/img/logo.png"
              alt="Menu Icon"
              className="w-6 h-6"
            />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {renderMenu(menuItems)}
          </ul>
        </div>
        {/* Brand Name */}
        <a className="btn btn-ghost text-black hover:bg-transparent text-xl">
          <img src="/img/logo.png" alt="" className="h-full" />
        </a>
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

          {/* sun icon */}
          <svg
            className="swap-on h-6 w-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path
              d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>

          {/* moon icon */}
          <svg
            className="swap-off h-6 w-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path
              d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>

        {user ? (
          <button
            onClick={handleProfile}
            className="bg-black text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
          >
            <div className="flex justify-between items-center gap-3">
              <BsGear className="text-xs" />
              <span>Profile</span>
            </div>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-black text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
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