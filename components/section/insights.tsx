import React, { useEffect } from "react";
import Link from "next/link";
import YoutubeCarousel from "../youtube";
import { FaFilm, FaThumbsUp, FaVideo } from "react-icons/fa";

const videos = [
  {
    videoId: "U5KIThytunI",
    title: "Create Account and implement wallet as Sign in",
    description:
      "CARDANO HUB INDONESIA CONNECT WALLET TUTORIAL, Starting login and join as decentral Users",
    thumbnail: "/thumbnails/chi-web.jpeg",
  },
  {
    videoId: "o7NRQjCxMLs",
    title: "Membangun Ecosystem Web3 Khususnya Cardano di Indonesia",
    description: "Surabaya Blockchain Alliance & Cardano: Membangun Ekosistem Blockchaindi Indonesia Timur",
    thumbnail: "/thumbnails/chi-podcast.jpeg",
  },
];
const youtubeChannelLink = "https://www.youtube.com/@CardanoHubIndonesia";
const bgImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

const Insights: React.FC = () => {
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
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handlePlay = (videoId: string) => {
    console.log("Play video with ID:", videoId);
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  const handleSubs = (videoId: string) => {
    console.log("Subscribe video with ID:", videoId);
    window.open(`${youtubeChannelLink}?sub_confirmation=1`, "_blank");
  };

  return (
    <div className="min-h-screen text-black  relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-white bg-center pointer-events-none overflow-hidden"
      />
      <div className="relative z-10 w-full text-center py-20 px-6 fade-in max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl font-bold leading-tight">
          <span className="text-gray-900">Insights &</span>{" "}
          <span className="bg-gradient-to-br from-red-100 via-red-400 to-red-600 bg-clip-text text-transparent">Highlights</span>
        </h1>

        <p className="text-gray-700 font-medium text-lg">
          Dive into our latest videos on YouTube to explore tutorials, AMAs, and updates about our decentralized ecosystem. Subscribe to <strong>@CardanoHubIndonesia</strong> for more!
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href={youtubeChannelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-transparent font-bold border-2 border-black rounded-lg hover:text-white hover:border-black hover:bg-black px-6 text-black inline-flex items-center gap-2"
          >
            <FaFilm /> <span className="pt-1">Explore Videos</span>
          </Link>
          <Link
            href={`${youtubeChannelLink}?sub_confirmation=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-red-500 border-none font-bold rounded-lg text-white px-6 hover:bg-red-800"
          >
            <FaThumbsUp /> <span className="pt-1">Subscribe</span>
          </Link>
        </div>
      </div>
      <div className="bg-black text-white min-h-screen max-w-screen px-4">
        <YoutubeCarousel videos={videos} onPlay={handlePlay} onSubs={handleSubs} />
      </div>
    </div>
  );
};

export default Insights;