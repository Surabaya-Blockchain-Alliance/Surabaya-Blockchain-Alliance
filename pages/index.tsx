import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import About from "@/components/about";
import { useEffect } from "react";
import { useState } from "react";
import Hero from "@/components/hero";
import Quests from "@/components/quests";
import Partnerships from "@/pages/partnerships";
import JoinCommunity from "@/components/join-community";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`bg-gray-100 min-h-screen`}
    >
      {/* Sticky Navbar */}
      <div
        className={`sticky top-0 z-50 transition-all ${isScrolled ? "bg-transparent" : "bg-transparent"
          }`}
      >
        <div className={`${geistSans.variable} ${geistMono.variable} px-40 ${isScrolled ? 'py-4' : 'py-1'}`}>
          <Navbar />
        </div>
      </div>

      {/* Hero Section */}
      <Hero />
      {/* About Section */}
      <About />
      {/* Quests Section */}
      <Quests />
      {/* Partnerships Section */}
      <Partnerships />  
      {/* JoinCommunity Section */}
      <JoinCommunity />  
      {/* Footer Section */}
      <Footer />
    </div>
  );
}
