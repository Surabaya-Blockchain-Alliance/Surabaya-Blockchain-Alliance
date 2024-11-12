"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import React from "react";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dropdownToggler, setDropdownToggler] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const pathUrl = usePathname();

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
  });

  return (
    <div className="bg-transparent navbar px-14 py-4">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            {menuData.map((menuItem, key) => (
              <li key={key}>
                {menuItem.newTab ? (
                  <div className="indicator">
                    <span className="text-black bg-white indicator-item badge">New</span>
                    <Link href={`${menuItem.path}`}>{menuItem.title}</Link>
                  </div>
                ) : (
                  <Link href={`${menuItem.path}`}>{menuItem.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <a className="text-xl btn btn-ghost">
          <img src="/images/logo/logo-dark.svg" width={150} height={50} alt="" />
        </a>
      </div>
      <div className="hidden navbar-center lg:flex">
        <ul className="px-1 menu menu-horizontal space-x-4">
          {menuData.map((menuItem, key) => (
            <li key={key}>
              {menuItem.newTab ? (
                <div className="indicator">
                  <span className="text-black bg-white indicator-item badge">New</span>
                  <Link href={`${menuItem.path}`}>{menuItem.title}</Link>
                </div>
              ) : (
                <Link href={`${menuItem.path}`}>{menuItem.title}</Link>
              )}
            </li>
          ))}

        </ul>
      </div>
      <div className="space-x-5 navbar-end">
        <ThemeToggler />
        <a href="" className="text-white btn bg-gradient-to-r from-blue-600 to-indigo-800 px-5">
          <img src="/images/nami-wallet.svg" width={24} height={24} alt="" />
          <span>Connect Nami Wallet</span>
        </a>
      </div>
    </div>
  );
};

// w-full delay-300

export default Header;
