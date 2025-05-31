import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config";
import { Teko } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BsArrowLeft } from "react-icons/bs";
import EventCard from "@/components/card/event"; 

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "nft-images"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventsClick = (id: any) => {
    router.push(`/join/event/${id}`);
  };

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  return (
    <div
      className="relative min-h-screen flex flex-col text-black overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      <Navbar />
      <main className="flex-grow w-full text-center py-20 px-6 fade-in relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            href="/"
          >
            <BsArrowLeft className="text-xs" />
            <span className={`font-semibold ${geistTeko.variable}`}>Back to Home</span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Coming up All</span>{" "}
            <span className="text-green-500">Event </span>
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Browse all minted event NFTs.
          </p>

          {loading && (
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
            </div>
          )}

          {error && (
            <div className="alert alert-error mt-2">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-gray-600">No events found.</p>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  schedule={new Date(event.time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: event.timezone || "UTC",
                  })}
                  joiners="0"
                  payment="10 ADA"
                  avatar={event.image}
                  onClick={() => handleEventsClick(event.id)} time={""}                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}