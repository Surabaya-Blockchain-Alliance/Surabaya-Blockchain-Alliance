import React, { useEffect } from "react";
import Link from "next/link";
import { BsArrowLeft, BsCalendar } from "react-icons/bs";
import { Teko } from "next/font/google";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

interface Video {
  title: string;
  videoId: string;
  description: string;
  publishedAt?: string; // Optional, for metadata
}

const videos: Video[] = [
  {
    title: "Create Account and implement wallet as Sign in",
    videoId: "U5KIThytunI",
    description: "CARDANO HUB INDONESIA CONNECT WALLET TUTORIAL, Starting login and join as decentral Users",
  },
  {
    title: "Membangun ecosystem web 3 khususnya Cardano di Indonesia",
    videoId: "o7NRQjCxMLs", 
    description: "Surabaya Blockchain Alliance & Cardano: Membangun Ekosistem Blockchaindi Indonesia Timur",
    publishedAt: "2025-05-22T12:00:00Z",
  },
];

const youtubeChannelLink = "https://www.youtube.com/@CardanoHubIndonesia";

const bgImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

const InsightsPage: React.FC = () => {
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
          <span className="text-gray-900">Insights &</span>{" "}
          <span className="text-green-500">Highlights</span>
        </h1>

        <p className="text-gray-700 font-medium text-lg">
          Dive into our latest videos on YouTube to explore tutorials, AMAs, and updates about our decentralized ecosystem. Subscribe to <strong>@CardanoHubIndonesia</strong> for more!
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href={youtubeChannelLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-transparent font-bold border-2 rounded-full hover:text-white hover:border-white px-6 text-black inline-flex items-center gap-2"
          >
            Explore Videos
          </Link>
          <Link
            href={`${youtubeChannelLink}?sub_confirmation=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-green-500 border-none font-bold rounded-full text-white px-6 hover:bg-green-600"
          >
            Subscribe
          </Link>
        </div>

        <div className="pt-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <Link
                key={index}
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-lg bg-transparent border border-black rounded-lg cursor-pointer hover:shadow-xl hover:scale-105 duration-300 ease-out transform transition-all"
              >
                <figure className="p-2">
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt={video.title}
                    className="rounded-xl w-full object-cover"
                    style={{ height: 180 }}
                  />
                </figure>
                <p className="font-semibold text-black leading-none text-lg px-4 py-1">{video.title}</p>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-start space-x-2">
                    <span className="text-xs">{video.description}</span>
                  </div>
                  <div className="block space-y-2 py-2 text-gray-700">
                    <div className="flex justify-start items-center space-x-2">
                      <BsCalendar />
                      <span className="text-sm font-semibold">
                        {video.publishedAt
                          ? new Date(video.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Unknown Date"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;