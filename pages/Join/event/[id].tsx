import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../config";
import { Teko } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaWallet } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import { BrowserWallet, Transaction, ForgeScript } from "@meshsdk/core";
import { getAssetInfoFromTx, getAssetOwner } from "@/utils/indexing";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const defaultPaymentRecipient =
  process.env.PAYMENT_RECIPIENT_ADDRESS ||
  "addr_test1qzf333svyuyxrt8aajhgjmews0737sf69uvn4xyt4ny2ent88fhr8q5eqrdqfhaqcu4fcd2hqfz6fw4h57jlgzfp6rlsvj37jm";
const policyId = "a727399922a075addd9d2ea1b494feb2b774f721d988e48b92fa89d2";

const stringToHex = (str) =>
  [...str].map((c) => ("0" + c.charCodeAt(0).toString(16)).slice(-2)).join("");

const validateMetadataLength = (metadata) => {
  const checkLength = (value, field) => {
    if (typeof value === "string" && Buffer.from(value).length > 64) {
      throw new Error(
        `Metadata field '${field}' is too long: ${value} (${Buffer.from(value).length} bytes, max 64)`
      );
    }
  };
  const traverse = (obj, path = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof value === "string") {
        checkLength(value, newPath);
      } else if (typeof value === "object" && value !== null) {
        traverse(value, newPath);
      }
    }
  };
  traverse(metadata);
};

const isValidCardanoAddress = (address) => {
  return typeof address === "string" && (address.startsWith("addr1") || address.startsWith("addr_test1"));
};

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [joinStatus, setJoinStatus] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ username: "", walletAddress: "" });
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser && id) {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "nft-images", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Event not found.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event.");
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfileAndWallets = async () => {
      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserProfile({
            username: userData.username || "",
            walletAddress: userData.walletAddress || "",
          });
        } else {
          setJoinStatus("❌ User profile not found. Please set up your profile.");
        }

        // Fetch available wallets
        const availableWallets = await BrowserWallet.getAvailableWallets();
        setWallets(availableWallets);
        if (availableWallets.length === 0) {
          setJoinStatus("❌ No Cardano wallets found. Please install a wallet like Nami or Eternl.");
        }
      } catch (error) {
        console.error("Error fetching user profile or wallets:", error);
        setJoinStatus("❌ Failed to fetch user profile or wallets.");
      }
    };
    fetchUserProfileAndWallets();
  }, [user]);

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const selectedWallet = await BrowserWallet.enable(walletId);
      const address = await selectedWallet.getChangeAddress();
      setWallet(selectedWallet);
      setWalletAddress(address);
      setJoinStatus("✅ Wallet connected.");
    } catch (error) {
      console.error("Wallet connection error:", error);
      setJoinStatus("❌ Failed to connect wallet.");
    }
  };

  const handleJoinEvent = async () => {
    if (!user) {
      setJoinStatus("❌ User not authenticated. Please sign in.");
      return;
    }
    if (!wallet || !walletAddress) {
      setJoinStatus("❌ Wallet not connected.");
      return;
    }
    if (!event) {
      setJoinStatus("❌ Event data not loaded.");
      return;
    }
    if (!userProfile.username || !userProfile.walletAddress) {
      setJoinStatus("❌ Profile incomplete. Please set up your username and wallet address.");
      return;
    }

    try {
      setJoinLoading(true);
      setJoinStatus("⏳ Preparing transaction...");

      const recipientAddress = event.creatorAddress && isValidCardanoAddress(event.creatorAddress)
        ? event.creatorAddress
        : defaultPaymentRecipient;

      const idToken = await user.getIdToken();
      const balance = await wallet.getBalance();
      const lovelace = balance.find((asset) => asset.unit === "lovelace")?.quantity || "0";
      if (parseInt(lovelace) < 10_000_000) {
        throw new Error("Insufficient balance. You need at least 10 ADA to join the event.");
      }
      const usedAddresses = await wallet.getUsedAddresses();
      const address = usedAddresses[0] || walletAddress;
      const assetName = stringToHex(event.assetName || `EventNFT-${Date.now()}`);
      const metadata = {
        721: {
          [policyId]: {
            [assetName]: {
              name: event.title.slice(0, 64) || "Event NFT",
              description: event.description.slice(0, 64) || "An event NFT on Cardano",
              image: event.cid.slice(0, 64),
              mediaType: "image/jpeg",
              creator: user.uid,
              eventDateTime: event.time,
              meetLink: event.link.slice(0, 64) || "",
              timezone: event.timezone || "UTC",
              tags: event.tags
                ? event.tags.map((tag) => tag.trim().slice(0, 64)).slice(0, 10)
                : ["event", "NFT", "cardano"],
            },
          },
        },
      };

      validateMetadataLength(metadata);
      const tx = new Transaction({ initiator: wallet });
      tx.mintAsset(ForgeScript.withOneSignature(walletAddress), {
        assetName,
        assetQuantity: "1",
        metadata,
        label: "721",
        recipient: address,
      });
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      await new Promise((resolve) => setTimeout(resolve, 30000));

      const assetInfos = await getAssetInfoFromTx(txHash);
      if (!assetInfos || assetInfos.length === 0) {
        throw new Error("Unable to retrieve asset info from transaction.");
      }

      const asset = assetInfos[0];
      const assetOwner = await getAssetOwner(`${asset.policyId}${Buffer.from(asset.assetName).toString("hex")}`);
      if (!assetOwner) {
        throw new Error("Unable to retrieve asset fingerprint.");
      }

      const joinData = {
        userId: user.uid,
        email: user.email,
        username: userProfile.username,
        walletAddress: userProfile.walletAddress,
        txHash,
        assetUnit: assetOwner.asset,
        timestamp: new Date().toISOString(),
        recipientAddress,
      };
      await setDoc(doc(db, `nft-images/${id}/joined`, user.uid), joinData);

      const txLink = `https://preview.cexplorer.io/tx/${txHash}`;
      const shortTxHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
      setJoinStatus(
        <>
          ✅ Successfully joined event! <span className="font-mono">{shortTxHash}</span>{" "}
          <a
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Transaction
          </a>
        </>
      );
    } catch (error) {
      console.error("Join error:", error);
      setJoinStatus(`❌ Error: ${error.message}`);
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
            href="/events"
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
                <p className="font-semibold text-gray-800">CID:</p>
                <p className="text-gray-600">{event.cid}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Asset Name:</p>
                <p className="text-gray-600">{event.assetName}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Policy ID:</p>
                <p className="text-gray-600">{event.policyId}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-gray-800">Event ID:</p>
                <p className="text-gray-600">{event.id}</p>
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
                  {event.creatorAddress
                    ? `${event.creatorAddress.slice(0, 6)}...${event.creatorAddress.slice(-4)}`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWalletModal(true)}
              className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2 mt-4"
              disabled={joinLoading}
            >
              <FaWallet />
              {walletAddress
                ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </button>

            {walletAddress && (
              <button
                onClick={handleJoinEvent}
                className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-md flex items-center justify-center gap-2 mt-2"
                disabled={joinLoading || !event.creatorAddress}
              >
                {joinLoading ? "Joining..." : "Join Event (Mint NFT - 10 ADA)"}
              </button>
            )}

            {joinStatus && (
              <div className={`alert mt-2 p-4 rounded-lg ${joinStatus.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <span>{joinStatus}</span>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center space-y-4 max-w-md w-full">
            <h2 className="text-xl font-bold">Select a Wallet</h2>
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                className="w-full py-2 border border-black text-black hover:bg-black hover:text-white rounded-md mb-2 flex items-center gap-2 justify-center"
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={joinLoading}
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 rounded-sm" />
                )}
                {wallet.name}
              </button>
            ))}
            <button
              onClick={() => setShowWalletModal(false)}
              className="text-sm text-gray-500 hover:underline"
              disabled={joinLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}