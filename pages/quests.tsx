import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config";
import { BsArrowLeft } from "react-icons/bs";
import QuestCard from "@/components/card/quest";
import { Quest } from "@/types/quest"
import Link from "next/link";
import GlowingRings from "@/components/animated/glowing";


export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: -50px -50px; }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const questsSnapshot = await getDocs(collection(db, "quests"));
        const questsData = questsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Quest[];
        setQuests(questsData);
      } catch (err) {
        console.error("Error fetching quests:", err);
        setError("Failed to load quests.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  return (
    <section
      className="relative bg-white min-h-screen flex flex-col text-black overflow-hidden"
    >
      <GlowingRings />
      <div className="flex w-full text-center pt-5 pb-20 px-6 fade-in relative z-10">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="cursor-pointer w-full pb-10 overflow-hidden">
            <Link href="/quests" className="card image-full h-auto rounded-xl">
              <img
                src="./img/bg-hero.svg"
                alt="Quests"
                className="w-full h-48 object-cover bg-opacity-10 rounded-2xl"
              />
              <div className="p-10 w-full text-end z-50 space-y-2 flex items-center justify-end">
                <div className="space-y-2">
                  <span className="font-semibold text-4xl text-white break-words whitespace-nowrap">Available <span className="bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">Quests</span></span>
                  <p className="font-normal text-sm flex items-center break-words whitespace-nowrap justify-end gap-2 text-gray-200">
                    <BsArrowLeft />
                    Explore and join quests to earn points!
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-gray-600"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
            </div>
          )}

          {error && (
            <div className="alert alert-error mt-2 text-red-600 font-semibold">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && quests.length === 0 && (
            <p className="text-gray-600">No quests available.</p>
          )}

          {!loading && !error && quests.length > 0 && (
            <QuestCard quests={quests} />
          )}
        </div>
      </div>
    </section>
  );
}