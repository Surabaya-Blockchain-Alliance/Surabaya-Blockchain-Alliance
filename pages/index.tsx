import { useEffect, useState } from "react";
import { db } from "../config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import BlogCard from "@/components/blog/blogCard"; 
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import About from "@/components/about";
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
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "blogposts"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data(),
        }));
        setPosts(postsData); 
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

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
    <div className={`bg-gray-100 min-h-screen`}>
      {/* Sticky Navbar */}
      <div
        className={`sticky top-0 z-50 transition-all ${isScrolled ? "bg-transparent" : "bg-transparent"}`}
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
      {/* Latest Blog Posts */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 bg-white">
          <h2 className="text-3xl text-black font-bold mb-8 text-center">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length > 0 ? (
              posts.map((post) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  description={post.description}
                  mediaUrl={post.mediaUrl}
                  id={post.id} 
                />
              ))
            ) : (
              <p>No blog posts available.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Partnerships Section */}
      <Partnerships />  
      {/* JoinCommunity Section */}
      <JoinCommunity />  
      {/* Footer Section */}
      <Footer />
    </div>
  );
}
