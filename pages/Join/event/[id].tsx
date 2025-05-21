import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/config";
import { Teko } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaCheckCircle, FaGift } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import ConnectWallet from "@/components/button/ConnectWallet";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const isValidCardanoAddress = (address) => {
  return typeof address === "string" && (address.startsWith("addr1") || address.startsWith("addr_test1"));
};

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [joinStatus, setJoinStatus] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ username: "", walletAddress: "" });
  const [hasJoined, setHasJoined] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log("Auth state changed:", { uid: firebaseUser?.uid, email: firebaseUser?.email });
      setUser(firebaseUser);
      if (!firebaseUser && id) {
        router.push("/signin");
      }
    });
    return () => unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (!id) return;

    const fetchEventAndJoinStatus = async () => {
      try {
        const docRef = doc(db, "nft-images", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Event not found.");
        }

        if (user) {
          const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
          const joinDocSnap = await getDoc(joinDocRef);
          setHasJoined(joinDocSnap.exists());
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event.");
        setLoading(false);
      }
    };
    fetchEventAndJoinStatus();
  }, [id, user]);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User profile fetched:", userData);
          setUserProfile({
            username: userData.username || "",
            walletAddress: userData.walletAddress || "",
          });
        } else {
          console.warn("User profile not found for UID:", user.uid);
          setJoinStatus("❌ User profile not found. Please set up your profile at /profile.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setJoinStatus("❌ Failed to fetch user profile. Please try again.");
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleWalletConnect = (address) => {
    if (isValidCardanoAddress(address)) {
      setWalletAddress(address);
      setJoinStatus("✅ Wallet connected.");
      console.log("Wallet connected via ConnectWallet:", address);
    } else {
      console.error("Invalid Cardano address from ConnectWallet:", address);
      setJoinStatus("❌ Invalid wallet address. Please reconnect a valid Cardano wallet.");
    }
  };

  const handleJoinEvent = async () => {
    if (!user || !auth.currentUser || user.uid !== auth.currentUser.uid) {
      console.error("Authentication error: User not authenticated or UID mismatch", {
        user,
        currentUser: auth.currentUser,
      });
      setJoinStatus("❌ User not authenticated. Please sign in again.");
      return;
    }
    if (!walletAddress) {
      console.error("Wallet error: No wallet address", { walletAddress });
      setJoinStatus("❌ Wallet not connected. Please connect a Cardano wallet.");
      return;
    }
    if (!isValidCardanoAddress(walletAddress)) {
      console.error("Wallet error: Invalid Cardano address", { walletAddress });
      setJoinStatus("❌ Invalid wallet address. Please reconnect a valid Cardano wallet.");
      return;
    }
    if (!event) {
      console.error("Event error: Event data not loaded", { event });
      setJoinStatus("❌ Event data not loaded. Please try again.");
      return;
    }
    if (hasJoined) {
      console.log("Join status: Already joined", { userId: user.uid, eventId: id });
      setJoinStatus("✅ You have already joined this event.");
      return;
    }

    try {
      setJoinLoading(true);
      setJoinStatus("⏳ Joining event...");

      const joinData = {
        email: user.email || null,
        username: userProfile.username && userProfile.username !== "" ? userProfile.username : null,
        walletAddress: walletAddress,
        checkedIn: null,
        checkInTimestamp: null,
        nftClaimEligible: null,
        metadata: {
          address: walletAddress,
          username: userProfile.username && userProfile.username !== "" ? userProfile.username : null,
          attestation: "default-attestation",
          eligible: false,
          merkleTreeProof: "default-proof",
        },
        nftClaimed: null,
        nftClaimTxHash: null,
      };

      console.log("Attempting to join event with data:", JSON.stringify(joinData, null, 2));

      const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
      await setDoc(joinDocRef, joinData);
      setHasJoined(true);
      setJoinStatus("✅ Successfully joined event!");
    } catch (error) {
      console.error("Join error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        eventId: id,
        userId: user.uid,
      });
      if (error.code === "permission-denied") {
        setJoinStatus("❌ Permission denied. Please ensure your wallet is connected and your profile is set up correctly.");
      } else {
        setJoinStatus(`❌ Error: ${error.message}`);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const renderImage = (imageUrl) => {
    if (!imageUrl) {
      return (
        <div className="h-64 w-full bg-gray-200 flex items-center justify-center text-gray-600 border rounded-lg">
          <span>No Image</span>
        </div>
      );
    }

    let src = imageUrl;
    if (imageUrl.startsWith("ipfs://")) {
      src = `https://sapphire-managing-narwhal-834.mypinata.cloud/ipfs/${imageUrl.replace("ipfs://", "")}`;
    } else if (!imageUrl.startsWith("https://") && !imageUrl.startsWith("data:image/")) {
      src = `https://sapphire-managing-narwhal-834.mypinata.cloud/ipfs/${imageUrl}`;
    }

    return (
      <div className="relative h-64 w-full">
        <img
          src={src}
          alt="Event image"
          className="h-full w-full object-cover border rounded-lg"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
          onLoad={(e) => {
            e.target.style.display = "block";
            e.target.nextSibling.style.display = "none";
          }}
        />
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-600 border rounded-lg"
          style={{ display: "none" }}
        >
          <span>Failed to load image</span>
        </div>
      </div>
    );
  };

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  if (loading) {
    return (
      <div
        className="relative min-h-screen flex flex-col text-black overflow-hidden bg-gray-100"
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
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/70 z-0"></div>
        <Navbar />
        <main className="flex-grow w-full text-center py-20 px-6 fade-in relative z-10">
          <div className="alert alert-error mt-2 max-w-4xl mx-auto bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
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
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      <Navbar />
      <main className="flex-grow w-full text-center py-20 px-6 fade-in relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center hover:text-blue-600 transition-colors"
            href="/join/Event"
          >
            <BsArrowLeft className="text-sm" />
            <span className={`font-semibold ${geistTeko.variable}`}>Back to Events</span>
          </Link>

          <h1 className={`text-5xl font-bold leading-tight ${geistTeko.variable}`}>
            <span className="text-gray-900">{event.title}</span>
          </h1>

          <div className="bg-white rounded-lg p-8 shadow-xl space-y-4">
            {renderImage(event.image)}
            <h2 className={`text-2xl font-bold ${geistTeko.variable}`}>{event.title}</h2>
            <p className="text-base font-medium text-gray-600 leading-relaxed">{event.description}</p>
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
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Created At:</p>
                <p className="text-gray-600">
                  {new Date(event.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Creator Address:</p>
                <p className="text-gray-600">
                  {event.address
                    ? `${event.address.slice(0, 6)}...${event.address.slice(-4)}`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <ConnectWallet onConnect={handleWalletConnect} />

            {walletAddress && (
              <button
                onClick={handleJoinEvent}
                className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2 mt-2"
                disabled={joinLoading || hasJoined}
              >
                {joinLoading ? "Joining..." : hasJoined ? "Joined Event" : "Join Event"}
              </button>
            )}

            {hasJoined && (
              <div className="space-y-2 mt-4">
                <Link
                  href={`/Join/event/${id}/check-in`}
                  className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2"
                >
                  <FaCheckCircle />
                  Go to Check-In
                </Link>
                {event.policyId && event.assetName && (
                  <Link
                    href={`/Join/event/${id}/claim`}
                    className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2"
                  >
                    <FaGift />
                    Claim NFT
                  </Link>
                )}
              </div>
            )}

            {joinStatus && (
              <div
                className={`alert mt-2 p-4 rounded-lg ${
                  joinStatus.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                <span>{joinStatus}</span>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
