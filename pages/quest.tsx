import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config";
import { useRouter } from "next/router";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface Quest {
  id: string;
  name: string;
  description: string;
  reward: string;
  deadline: string;
  status: string;
  creator: string;
}

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

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
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen text-gray-800">
        <div
          className="flex justify-between items-start gap-5"
          style={{
            fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
            animation: 'bg-scrolling-reverse 0.92s linear infinite',
          }}
        >
          <div
            className="bg-white w-full max-w-3xl shrink-0 shadow-2xl py-5 px-10 overflow-y-auto"
            style={{ maxHeight: "100vh" }}
          >
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">Available Quests</h1>
              <p className="text-sm font-medium">Explore and join quests to earn points!</p>
            </div>

            {loading ? (
              <p>Loading quests...</p>
            ) : quests.length === 0 ? (
              <p>No quests available.</p>
            ) : (
              <div className="space-y-4">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="border p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => handleQuestClick(quest.id)}
                  >
                    <h2 className="text-xl font-semibold">{quest.name}</h2>
                    <p className="text-sm">{quest.description}</p>
                    <p className="text-sm">Reward: {quest.reward} tokens</p>
                    <p className="text-sm">Deadline: {new Date(quest.deadline).toLocaleDateString()}</p>
                    <p className="text-sm">Status: {quest.status}</p>
                    <p className="text-sm text-blue-600">Quest ID: {quest.id}</p>
                  </div>
                ))}
              </div>
            )}

            <footer className="footer bg-white text-black items-center px-10 py-4 border-t mt-4">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" width={46} />
                <p>© {currentYear} - All rights reserved</p>
              </aside>
            </footer>
          </div>

          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
              <span className="text-blue-800">Cardano Hub</span>{" "}
              <span className="text-red-600">Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/7b819196-d55f-494b-b0b1-c78b39656bfe/RD0XuFNO9P.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-medium">
              Join quests and earn rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}