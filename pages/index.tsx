import { useEffect, useState } from "react";
import { db } from "../config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import BlogCard from "@/components/blog/blogCard"; 
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import About from "@/components/about";
import Hero from "@/components/hero";
import Quests from "@/components/quests";
import Partnerships from "@/components/partnerships";
import JoinCommunity from "@/components/join-community";
import Footer from "@/components/footer";
import InsightsPage from "@/components/Youtube";

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
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`bg-gray-100 min-h-screen`}>
      {/* Sticky Navbar */}
      <div
        className={`sticky top-0 z-50 transition-all ${
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className={`${geistSans.variable} ${geistMono.variable} px-6 md:px-20 lg:px-40 ${isScrolled ? 'py-4' : 'py-1'}`}>
          <Navbar />
        </div>
      </div>

      {/* Hero Section */}
      <Hero />
      {/* About Section */}
      <About />
      {/* Quests Section */}
      <Quests />
      <InsightsPage />
      {/* Latest Blog Posts */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-black font-bold mb-8 text-center">Latest Blog Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <p className="text-center col-span-full">Loading posts...</p>
            ) : posts.length > 0 ? (
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
              <p className="text-center col-span-full">No blog posts available.</p>
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
