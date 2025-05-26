import React, { useEffect } from "react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { FaWhatsapp, FaTelegramPlane, FaDiscord, FaTwitter, FaYoutube } from "react-icons/fa";
import { Teko } from "next/font/google";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

interface CommunityLink {
  name: string;
  icon: React.ReactNode;
  description: string;
  link: string;
}

const communityLinks: CommunityLink[] = [
  {
    name: "X Community",
    icon: <FaTwitter className="text-4xl text-black-500" />,
    description: "Follow us on X for the latest updates, discussions, and community engagement!",
    link: process.env.URL_TWITTER,
  },
  {
    name: "Telegram Channel",
    icon: <FaTelegramPlane className="text-4xl text-blue-500" />,
    description: "Stay informed with our Telegram channel for news and announcements!",
    link: "https://t.me/chubindonesia",
  },
  {
    name: "Discord Server",
    icon: <FaDiscord className="text-4xl text-purple-500" />,
    description: "Connect with our community on Discord for in-depth conversations and support!",
    link: process.env.URL_DISCORD,
  },
   {
    name: "Youtube",
    icon: <FaYoutube className="text-4xl text-purple-500" />,
    description: "Get the latest update from us, podcast and other event video for learning more about cardano",
    link: "https://www.youtube.com/@CardanoHubIndonesia",
  },
];

const bgImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

const CommunityPage: React.FC = () => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px 0; }
      }
      .fade-in {
        animation: fadeIn 3s ease-out;
      }
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .navbar-slide-in {
        animation: slideIn 5s ease-out;
      }
      @keyframes slideIn {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(0); }
      }
      .community-card {
        background: white;
        border: 2px solid #ddd;
        border-radius: 12px;
        padding: 1.5rem;
        transition: transform 0.3s, box-shadow 0.3s;
      }
      .community-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .community-button {
        background-color: #22c55e;
        color: white;
        font-weight: bold;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        transition: background-color 0.3s;
        text-decoration: none;
        display: inline-block;
      }
      .community-button:hover {
        background-color: #16a34a;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="min-h-screen text-black relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "center",
          minHeight: "100vh",
          animation: "bg-scrolling-reverse 10s linear infinite",
        }}
      />
      <div className="relative z-10 w-full text-center py-20 px-6 fade-in max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 justify-center"
        >
          <BsArrowLeft className="text-xl" />
          <span className={`font-semibold ${geistTeko.variable}`}>Back to Home</span>
        </Link>

        <h1 className="text-5xl font-bold leading-tight">
          <span className="text-gray-900">Join Our</span>{" "}
          <span className="text-green-500">Community</span>
        </h1>

        <p className="text-gray-700 font-medium text-lg">
          Connect with us on <strong>X</strong>, <strong>Telegram</strong>, and <strong>Discord</strong> to stay updated, share ideas, and be part of our decentralized ecosystem!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
          {communityLinks.map((community, index) => (
            <div
              key={index}
              className="community-card flex flex-col items-center text-center space-y-4"
            >
              {community.icon}
              <h3 className="text-xl font-semibold text-gray-800">{community.name}</h3>
              <p className="text-gray-600 text-sm">{community.description}</p>
              <a
                href={community.link}
                target="_blank"
                rel="noopener noreferrer"
                className="community-button"
              >
                Join Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;