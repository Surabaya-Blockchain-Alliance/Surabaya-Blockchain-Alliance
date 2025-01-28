import React from "react";
import ButtonBase from "./button/base";
import Link from "next/link";

// Updated MenuItem interface with description for each item.
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
      { label: "About", href: "#", description: "Learn more about our community" },
      { label: "Read Docs", href: "#", description: "Find documentation on how to get started" },
    ],
  },
  { label: "Quests", href: "#"},
  { label: "Events", href: "#" },
  { label: "Partnerships", href: "#" },
];

const Navbar: React.FC = () => {
  const renderMenu = (items: MenuItem[], isSubMenu: boolean = false) => {
    return items.map((item, index) => (
      <li key={index}>
        {item.subMenu ? (
          <details>
            <summary className="font-semibold">{item.label}</summary>
            <ul className="p-2 bg-white flex items-center justify-between gap-3 z-50">
              <div className="cursor-pointer hover:border-gray-200 border-2 border-transparent rounded-2xl transition-all shadow-xl overflow-hidden">
                <div className="card image-full h-40 rounded-2xl">
                  <img
                    src="https://t3.ftcdn.net/jpg/07/00/34/62/360_F_700346277_CecN7LvdCIRGdxjwahHa00gqRqAO6CcG.jpg"
                    alt="Shoes"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <Link
                    className="p-4 w-32 text-left hover:underline z-50"
                    href="/community"
                  >
                    <span className="font-semibold text-lg text-white">Community</span>
                    <p className="font-normal text-xs text-gray-200 break-words whitespace-normal">
                      Join Our Community!
                    </p>
                  </Link>
                </div>
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
              src="http://www.w3.org/2000/svg"
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
        <a className="btn btn-ghost text-black rounded-full hover:bg-transparent text-xl">
          Cardano Hub Indonesia
        </a>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex text-black">
        <ul className="menu menu-horizontal px-1">
          {renderMenu(menuItems)}
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end">
        <ButtonBase label="Let's Connect" cn="btn rounded-full font-semibold bg-black text-white" />
      </div>
    </div>
  );
};

export default Navbar;
