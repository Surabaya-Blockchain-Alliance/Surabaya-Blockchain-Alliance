import { useEffect, useState } from "react";
import { db } from "../config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import BlogCard from "@/components/blog/blogCard";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import About from "@/components/section/about";
import Hero from "@/components/section/hero";
import Quests from "@/components/section/event-quest";
import Partnerships from "@/components/section/partnerships";
import JoinCommunity from "@/components/section/join-community";
import Footer from "@/components/footer";
import Insights from "@/components/section/insights";
import RecentBlogs from "@/components/section/recent-blogs";

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
    <div className={`bg-white min-h-screen`}>
      {/* Hero */}
      <Hero />
      {/* About */}
      <About />
      {/* Quests */}
      <Quests />
      {/* Insights */}
      <Insights />
      {/* Recent Blogs */}
      <RecentBlogs />
      {/* Partnerships */}
      <Partnerships />
      {/* JoinCommunity */}
      <JoinCommunity />
    </div>
  );
}
