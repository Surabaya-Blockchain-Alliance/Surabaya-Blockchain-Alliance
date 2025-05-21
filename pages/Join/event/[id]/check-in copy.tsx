import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../../config";
import { Teko } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BsArrowLeft } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { BrowserWallet } from "@meshsdk/core";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

export default function EventCheckInPage() {
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser && id) {
        router.push("/signin");
      } else {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (!id || !user) return;

    const fetchEventAndCheckIn = async () => {
      try {
        const docRef = doc(db, "nft-images", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          setError("Event not found.");
          setLoading(false);
          return;
        }

        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);

        const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
        const joinDocSnap = await getDoc(joinDocRef);

        if (joinDocSnap.exists()) {
          setHasJoined(true);
          const joinData = joinDocSnap.data();
          setHasCheckedIn(!!joinData.checkedIn);
        } else {
          setHasJoined(false);
        }

        if (eventData.time && eventData.timezone) {
          const eventDateTime = new Date(eventData.time);
          const now = new Date();
          const nowInEventTimezone = new Date(
            now.toLocaleString("en-US", { timeZone: eventData.timezone })
          );
          setIsEventStarted(nowInEventTimezone >= eventDateTime);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching event or join data:", err);
        setError("Failed to load event or join data.");
        setLoading(false);
      }
    };

    fetchEventAndCheckIn();
  }, [id, user]);

  const handleCheckIn = async () => {
    if (!user) {
      setCheckInStatus("❌ User not authenticated. Please sign in.");
      return;
    }
    if (!hasJoined) {
      setCheckInStatus("❌ You haven’t joined this event.");
      return;
    }
    if (!isEventStarted) {
      setCheckInStatus("❌ Event has not started yet.");
      return;
    }
    if (hasCheckedIn) {
      setCheckInStatus("❌ You have already checked in.");
      return;
    }

    try {
      // Connect to the user's Cardano wallet to get their address
      const wallet = await BrowserWallet.enable("nami");
      const walletAddress = await wallet.getChangeAddress();

      // Fetch the username from the user's Firestore document
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const username = userDocSnap.exists()
        ? userDocSnap.data().username || "Anonymous"
        : "Anonymous";

      // Generate metadata
      const attestation = `attestation-${user.uid}-${Date.now()}`; // Simplified attestation (e.g., a unique ID)
      const eligible = !!(event.policyId && event.assetName); // Already computed in the original code
      const merkleTreeProof = "dummy-proof"; // Placeholder for Merkle tree proof

      const metadata = {
        address: walletAddress,
        username: username,
        attestation: attestation,
        eligible: eligible,
        merkleTreeProof: merkleTreeProof,
      };

      // Update the join document with check-in data and metadata
      const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
      const updateData = {
        checkedIn: true,
        checkInTimestamp: new Date().toISOString(),
        nftClaimEligible: eligible,
        metadata: metadata, // Store the metadata in the join document
      };

      await updateDoc(joinDocRef, updateData);
      setHasCheckedIn(true);
      setCheckInStatus(
        event.policyId && event.assetName
          ? "✅ Successfully checked in! You are now eligible to claim your NFT."
          : "✅ Successfully checked in!"
      );
    } catch (error) {
      console.error("Check-in error:", error);
      setCheckInStatus(`❌ Error: ${error.message}`);
    }
  };

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  if (loading) {
    return (
      <div
        className="relative min-h-screen flex flex-col text-black overflow-hidden bg-gray-100"
        style={{
          backgroundImage: `${bgImage}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/70 z-0"></div>
        <Navbar />
        <main className="flex-grow w-full text-center py-20 px-6 relative z-10">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
            </svg>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div
        className="relative min-h-screen flex flex-col text-black overflow-hidden bg-gray-100"
        style={{
          backgroundImage: `${bgImage}`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/70 z-0"></div>
        <Navbar />
        <main className="flex-grow w-full text-center py-20 px-6 relative z-10">
          <div className="alert bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
            <span>{error || "Event not found."}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col text-black overflow-hidden bg-gray-100"
      style={{
        backgroundImage: `${bgImage}`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      <Navbar />
      <main className="flex-grow w-full text-center py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
            href={`/events/${id}`}
          >
            <BsArrowLeft className="text-sm" />
            <span className={`font-semibold ${geistTeko.variable}`}>Back to Event</span>
          </Link>

          <h1 className={`text-5xl font-bold leading-tight ${geistTeko.variable}`}>
            Check In to {event.title}
          </h1>

          <div className="bg-white rounded-lg p-8 shadow-xl space-y-4">
            <h2 className={`text-2xl font-bold ${geistTeko.variable}`}>{event.title}</h2>
            <p className="text-base font-medium text-gray-600">{event.description}</p>

            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Time:</p>
                <p className="text-gray-600">
                  {new Date(event.time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: event.timezone || "UTC",
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Meeting Link:</p>
                <p>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {event.link}
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-800">Check-In Status:</p>
              <p className={`text-base ${hasCheckedIn ? "text-green-600" : "text-gray-600"}`}>
                {hasCheckedIn ? "✅ Checked In" : "Not Checked In"}
              </p>
            </div>

            <button
              onClick={handleCheckIn}
              className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2 mt-4"
              disabled={hasCheckedIn || !hasJoined || !isEventStarted}
            >
              <FaCheckCircle />
              {hasCheckedIn ? "Already Checked In" : "Check In to Event"}
            </button>

            {checkInStatus && (
              <div
                className={`alert mt-2 p-4 rounded-lg ${
                  checkInStatus.startsWith("✅")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span>{checkInStatus}</span>
              </div>
            )}

            {!hasJoined && (
              <div className="alert bg-yellow-100 text-yellow-700 p-4 rounded-lg mt-2">
                <span>You haven’t joined this event yet.</span>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}