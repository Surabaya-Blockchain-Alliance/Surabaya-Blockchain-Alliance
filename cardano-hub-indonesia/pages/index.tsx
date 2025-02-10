import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]`}
    >
      <Hero />
    </div>
  );
}
