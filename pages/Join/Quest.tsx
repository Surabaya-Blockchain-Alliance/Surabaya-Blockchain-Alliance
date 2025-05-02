import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BsCheck2Circle } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const questProjects = [
  {
    id: "quest-1",
    title: "Follow, Engage & Win up to 500 XFI",
    description: "By Community Nodes",
    prize: "500 XFI",
    rewards: "20",
    schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
    avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    media: [
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    ],
  },
  {
    title: "Follow, Engage & Win up to 300 XFI",
    description: "By Admin Nodes",
    prize: "300 XFI",
    rewards: "20",
    schedule: "26 Jan at 7.00 AM - 9 Feb at 8.00 AM",
    avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    media: [
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    ],
    id: "quest-2",
  },
];

export default function JoinQuestPage() {
  const [quest, setQuest] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { questId } = router.query;

  useEffect(() => {
    if (questId) {
      console.log("Quest ID: ", questId);

      const questDetails = questProjects.find((quest) => quest.id === questId);
      if (questDetails) {
        setQuest(questDetails);
      } else {
        setStatus("Quest not found.");
      }
      setLoading(false); 
    } else {
      setStatus("Quest ID is missing.");
      setLoading(false);
    }
  }, [questId]);

  const handleJoinQuest = async () => {
    if (!walletAddress) {
      return alert("Wallet not connected.");
    }

    setLoading(true);
    try {
      setStatus(`✅ Successfully joined the quest!`);
    } catch (error) {
      setStatus("Something went wrong while joining the quest.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!quest) {
    return <div>{status}</div>; 
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen text-gray-800">
        <div className="flex justify-between items-start gap-5">
          <div className="bg-white w-full max-w-xl shrink-0 shadow-2xl py-5 px-10 overflow-y-auto" style={{ maxHeight: "100vh" }}>
            <div className="flex justify-between items-center">
              <img src="/img/logo.png" alt="logo" width={200} />
            </div>

            <div className="pt-16 pb-5">
              <h1 className="text-3xl font-extrabold">{quest.title}</h1>
              <p className="text-sm font-medium">{quest.description}</p>
              <p className="text-sm font-medium">Reward: {quest.prize}</p>
              <p className="text-sm font-medium">Deadline: {quest.schedule}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="label">Follow on Twitter</label>
                  <button className="btn w-full bg-gray-100 text-black hover:bg-black hover:text-white border border-gray-300">
                    Follow Twitter
                    <BsCheck2Circle className="ml-2 inline" />
                  </button>
                </div>

                <div>
                  <label className="label">Join Discord</label>
                  <button className="btn w-full bg-gray-100 text-black hover:bg-black hover:text-white border border-gray-300">
                    Join Discord
                    <BsCheck2Circle className="ml-2 inline" />
                  </button>
                </div>

                <div>
                  <label className="label">Retweet Post</label>
                  <button className="btn w-full bg-gray-100 text-black hover:bg-black hover:text-white border border-gray-300">
                    Retweet Post
                    <BsCheck2Circle className="ml-2 inline" />
                  </button>
                </div>

                <div>
                  <label className="label">Like Post</label>
                  <button className="btn w-full bg-gray-100 text-black hover:bg-black hover:text-white border border-gray-300">
                    Like Post
                    <BsCheck2Circle className="ml-2 inline" />
                  </button>
                </div>
              </div>

              <ConnectWallet onConnect={setWalletAddress} onVerified={(address) => setWalletAddress(address)} />

              <button className="btn w-full bg-black text-white hover:bg-gray-800" onClick={handleJoinQuest} disabled={loading}>
                {loading ? "Joining..." : "Join Quest"}
                <BsCheck2Circle className="ml-2 inline" />
              </button>
            </div>

            <footer className="footer bg-white text-black items-center px-10 py-4 border-t mt-4">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" width={46} />
                <p>© {new Date().getFullYear()} - All rights reserved</p>
              </aside>
            </footer>
          </div>

          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
              <span className="text-blue-800">Cardano Hub</span> <span className="text-red-600">Indonesia</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/7b819196-d55f-494b-b0b1-c78b39656bfe/RD0XuFNO9P.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-medium">Complete social actions and earn rewards!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
