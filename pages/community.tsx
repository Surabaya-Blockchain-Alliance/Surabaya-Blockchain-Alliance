import React from "react";
import Link from "next/link";
import { FaTelegramPlane, FaDiscord, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Teko } from "next/font/google";


interface CommunityLink {
  name: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  text: string;
  customClass: string;
}

const communityLinks: CommunityLink[] = [
  {
    name: "X Community",
    icon: <FaXTwitter className="text-4xl text-black" />,
    description: "Follow us on X for the latest updates, discussions, and community engagement!",
    link: process.env.NEXT_PUBLIC_URL_TWITTER || "#",
    text: "Follow",
    customClass : "bg-white text-black"
  },
  {
    name: "Telegram Channel",
    icon: <FaTelegramPlane className="text-4xl text-blue-500" />,
    description: "Stay informed with our Telegram channel for news and announcements!",
    link: "https://t.me/chubindonesia",
    text: "Join",
    customClass : "bg-black text-white"
  },
  {
    name: "Discord Server",
    icon: <FaDiscord className="text-4xl text-indigo-600" />,
    description: "Connect with our community on Discord for in-depth conversations and support!",
    link: process.env.NEXT_PUBLIC_URL_DISCORD || "#",
    text: "Join",
    customClass : "bg-black text-white"
  },
  {
    name: "Youtube",
    icon: <FaYoutube className="text-4xl text-red-500" />,
    description: "Get the latest updates, podcasts, and event videos to learn more about Cardano.",
    link: "https://www.youtube.com/@CardanoHubIndonesia",
    text: "Subscribe",
    customClass : "bg-white text-black"
  },
];

const CommunityPage: React.FC = () => {
  return (
    <section className="relative h-auto overflow-hidden text-black bg-white p-20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
        {/* Left Column */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-6xl lg:text-8xl font-bold">Join Our Community</h1>
          <h2 className="text-2xl font-medium">
            Connect with us on <strong>X</strong>, <strong>Telegram</strong>, <strong>Discord</strong> and <strong>YouTube</strong> to stay updated, share ideas, and be part of our decentralized ecosystem!
          </h2>
        </div>

        {/* Right Column */}
        <div className="grid grid-cols-2 gap-0 w-full lg:w-1/2">
          {communityLinks.map((link, idx) => (
            <div
              key={idx}
              className={`p-6 border border-gray-300 ${link.customClass}`}
            >
              <div className="mb-3">{link.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{link.name}</h3>
              <p className="text-sm mb-4">{link.description}</p>
              <Link
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm underline font-semibold ${link.customClass}
                  }`}
              >
                {link.text}
              </Link>
            </div>

          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityPage;
