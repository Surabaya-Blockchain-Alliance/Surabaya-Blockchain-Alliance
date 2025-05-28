import React, { useEffect, useState } from "react";
import ButtonBase from "./button/base";
import "@meshsdk/react/styles.css";
import { MeshProvider } from "@meshsdk/react";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoIcon from "./LogoIcon";
import { BsArrowRight, BsGear } from "react-icons/bs"; // Added BsGear for gear icon
import { auth } from "../config"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase auth state listener

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
  { label: "Quests", href: "/quest" },
  { label: "Events", href: "/Event" },
  { label: "Contact Us", href: "/Contact-Us" },
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
    <div className="navbar bg-gray-100 bg-opacity-50 rounded-full">
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost hover:bg-none rounded-full"
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
      <div className="navbar-end">
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
            className="bg-black text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
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