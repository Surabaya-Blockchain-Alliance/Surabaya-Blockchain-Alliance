import React, { useEffect } from "react";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const partnerLogos = [
  { name: "CommunityNode", src: "/logos/comunitynode.jpg" },
  { name: "aiken", src: "/logos/aiken.jpeg" },
  { name: "Mesh SDK", src: "/logos/mesh.png" },
  { name: "Project Catalyst", src: "/logos/catalyst.png" },
];

const bgImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

const Partnerships: React.FC = () => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px 0; }
      }

      /* Fade-in animation for the page */
      .fade-in {
        animation: fadeIn 3s ease-out;
      }

      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }

      /* Slide-in animation for Navbar */
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
      <div className="relative z-20">
      </div>

      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundRepeat: "repeat", 
          backgroundSize: "auto", 
          backgroundPosition: "center",
          height: "100vh", 
          animation: "bg-scrolling-reverse 10s linear infinite", 
        }}
      />

      <div className="w-full text-center py-20 px-6 z-10 relative fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            href="#"
          >
            <BsArrowLeft className="text-xs" />
            <span className={`font-semibold ${geistTeko.variable}`}>Our Partnerships</span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Powering the</span>{" "}
            <span className="text-green-500">Decentralized Future</span>
          </h1>

          <p className="text-gray-700 font-medium text-lg">
            We proudly collaborate with forward-thinking protocols like <strong>CommunityNode</strong>, <strong>BitcoinOS</strong>, and <strong>Lace Wallet</strong> to enable seamless cross-chain liquidity, identity, and growth.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              className="btn bg-transparent font-bold border-2 rounded-full hover:text-white hover:border-white px-6 text-black"
              href="/partners"
            >
              <BsArrowLeft className="text-xs" />
              Explore Partners
            </Link>
            <Link
              className="btn bg-green-500 border-none font-bold rounded-full text-white px-6 hover:bg-green-600"
              href="/join"
            >
              Join Now
            </Link>
          </div>

          <div className="pt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Ecosystem Collaborators</h2>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {partnerLogos.map((logo, index) => (
                <img
                  key={index}
                  src={logo.src}
                  alt={logo.name}
                  className="h-12 w-auto grayscale hover:grayscale-0 transition duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnerships;
