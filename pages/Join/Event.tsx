import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BsCheck2Circle } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const eventProjects = [
  {
    id: "event-1",
    title: "Blockchain Conference 2025",
    description: "Join us for the biggest blockchain conference of the year!",
    prize: "Exclusive NFT Pass",
    rewards: "50",
    schedule: "10 May at 9.00 AM - 12 May at 5.00 PM",
    avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    media: [
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    ],
  },
  {
    id: "event-2",
    title: "Web3 Hackathon 2025",
    description: "Innovate and build the future of the Web3 space.",
    prize: "Cash Prize of $5000",
    rewards: "100",
    schedule: "15 May at 10.00 AM - 17 May at 6.00 PM",
    avatars: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    media: [
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    ],
  },
];

export default function JoinEventPage() {
  const [event, setEvent] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true); 
  const router = useRouter();
  const { eventId } = router.query;

  useEffect(() => {
    if (eventId) {
      console.log("Event ID: ", eventId);

      const eventDetails = eventProjects.find((event) => event.id === eventId);
      if (eventDetails) {
        setEvent(eventDetails);
      } else {
        setStatus("Event not found.");
      }
      setLoading(false);
    } else {
      setStatus("Event ID is missing.");
      setLoading(false);
    }
  }, [eventId]);

  const handleJoinEvent = async () => {
    if (!walletAddress) {
      return alert("Wallet not connected.");
    }

    setLoading(true);
    try {
      setStatus(`✅ Successfully joined the event!`);
    } catch (error) {
      setStatus("Something went wrong while joining the event.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
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
              <h1 className="text-3xl font-extrabold">{event.title}</h1>
              <p className="text-sm font-medium">{event.description}</p>
              <p className="text-sm font-medium">Prize: {event.prize}</p>
              <p className="text-sm font-medium">Schedule: {event.schedule}</p>
            </div>

            <div className="space-y-4">
              <ConnectWallet onConnect={setWalletAddress} onVerified={(address) => setWalletAddress(address)} />
              <button className="btn w-full bg-black text-white hover:bg-gray-800" onClick={handleJoinEvent} disabled={loading}>
                {loading ? "Joining..." : "Join Event"}
                <BsCheck2Circle className="ml-2 inline" />
              </button>
            </div>
          </div>

          <div className="bg-transparent text-center p-48">
            <h1 className="text-4xl font-semibold">
              <span className="text-blue-800">Cardano Hub Indonesia</span> <span className="text-red-600">2025 Events</span>
            </h1>
            <DotLottieReact
              src="https://lottie.host/7b819196-d55f-494b-b0b1-c78b39656bfe/RD0XuFNO9P.lottie"
              loop
              autoplay
              style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}
            />
            <p className="text-lg font-medium">Complete social actions and earn event rewards!</p>
          </div>
        </div>
      </div>
      <footer className="footer bg-white text-black items-center px-10 py-4 border-t mt-4">
              <aside className="grid-flow-col items-center">
                <img src="/img/emblem.png" alt="" width={46} />
                <p>© {new Date().getFullYear()} - All rights reserved</p>
              </aside>
            </footer>
    </div>
  );
}
