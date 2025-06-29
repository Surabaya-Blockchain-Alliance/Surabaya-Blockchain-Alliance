import About from "@/components/section/about";
import Hero from "@/components/section/hero";
import Quests from "@/components/section/event-quest";
import Partnerships from "@/components/section/partnerships";
import JoinCommunity from "@/components/section/join-community";
import Insights from "@/components/section/insights";
import RecentBlogs from "@/components/section/recent-blogs";



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
