import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config";
import { Teko } from "next/font/google";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BsArrowLeft } from "react-icons/bs";
import QuestCard from "@/components/card/quests";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

interface Quest {
  id: string;
  name: string;
  description: string;
  reward: string;
  deadline: string;
  status: string;
  creator: string;
  avatars?: string;
  media?: string[];
}

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

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

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}/do`);
  };

  // Check if any quest is active (not past deadline and not "end" status)
  const hasActiveQuests = quests.some((quest) => {
    const deadlineDate = new Date(quest.deadline);
    const currentDate = new Date();
    const isNotPastDeadline = deadlineDate >= currentDate;
    const isNotEnded = quest.status.toLowerCase() !== "end";
    return isNotPastDeadline && isNotEnded;
  });

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  return (
    <div
      className="relative min-h-screen flex flex-col text-black overflow-hidden"
      style={{
        fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "repeat",
        animation: "bg-scrolling-reverse 0.92s linear infinite",
        backgroundPosition: "0 0",
      }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>

      <Navbar />
      <main className="flex-grow w-full text-center py-20 px-6 fade-in relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {hasActiveQuests && (
            <button
              onClick={() => router.push("/")}
              className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            >
              <BsArrowLeft className="text-xs" />
              <span className={`font-semibold ${geistTeko.variable}`}>Back to Home</span>
            </button>
          )}

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Available</span>{" "}
            <span className="text-blue-600">Quests</span>
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Explore and join quests to earn points!
          </p>

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
            <QuestCard quests={quests} onQuestClick={handleQuestClick} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}