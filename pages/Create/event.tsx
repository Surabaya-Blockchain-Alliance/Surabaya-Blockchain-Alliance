import { useState, useEffect } from "react";
import { getAssetInfoFromTx, getAssetOwner } from "@/utils/indexing";
import { BrowserWallet, Transaction, ForgeScript } from "@meshsdk/core";
import { uploadFile } from "../../utils/upload";
import { FaWallet } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import { Teko } from "next/font/google";
import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { auth, db } from "../../config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Asia/Jakarta", label: "Jakarta (WIB)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

// Font
const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

const paymentRecipient =
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

export default function MintNFTPage() {
  const [form, setForm] = useState({
    name: "",
    image: "",
    date: "",
    time: "",
    description: "",
    tags: "",
    meetLink: "",
    platform: "gmeet",
    timezone: "UTC",
  });
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [uploadInfo, setUploadInfo] = useState({ cid: "", ipfsUrl: "", gatewayUrl: "" });
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push("/signin");
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchWallets = async () => {
      try {
        const availableWallets = await BrowserWallet.getAvailableWallets();
        setWallets(availableWallets);
        if (availableWallets.length === 0) {
          alert("No Cardano wallets found. Please install a wallet like Nami or Eternl.");
        } else {
          setShowWalletModal(true);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
        setStatus("❌ Failed to fetch wallets.");
      }
    };
    fetchWallets();
  }, [user]);

  const handleWalletSelect = async (walletId) => {
    setShowWalletModal(false);
    try {
      const selectedWallet = await BrowserWallet.enable(walletId);
      const address = await selectedWallet.getChangeAddress();
      setWallet(selectedWallet);
      setWalletAddress(address);
      setStatus("✅ Wallet connected.");
    } catch (error) {
      console.error("Wallet connection error:", error);
      setStatus("❌ Failed to connect wallet.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatus("⏳ Uploading image...");

    try {
      const { cid, ipfsUrl } = await uploadFile(file);
      const pinataGatewayUrl = `https://sapphire-managing-narwhal-834.mypinata.cloud/ipfs/${cid}`;
      setForm({ ...form, image: pinataGatewayUrl });
      setUploadInfo({ cid, ipfsUrl, gatewayUrl: pinataGatewayUrl });
      setStatus("✅ Image uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);
      setStatus(`❌ Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.date && form.time && form.platform) {
      const meetLink = generateMeetLink(form.platform, form.date, form.time);
      setForm((prev) => ({ ...prev, meetLink }));
    }
  }, [form.date, form.time, form.platform]);

  const generateMeetLink = (platform, date, time) => {
    if (!date || !time) return "";
    const randomKey =
      platform === "zoom"
        ? Math.floor(1000000000 + Math.random() * 9000000000).toString()
        : `${Math.random().toString(36).substring(2, 5)}-${Math.random()
            .toString(36)
            .substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    return platform === "zoom"
      ? `https://zoom.us/j/${randomKey}`
      : `https://meet.google.com/${randomKey}`;
  };

  const handleSignMinter = async () => {
    if (!user) {
      setStatus("❌ User not authenticated. Please sign in.");
      return;
    }
    if (!wallet || !walletAddress) {
      setStatus("❌ Wallet not connected.");
      return;
    }
    if (!form.image || !uploadInfo.cid) {
      setStatus("❌ Please upload an image.");
      return;
    }
    if (!form.name) {
      setStatus("❌ Please provide an event name.");
      return;
    }
    if (!form.date || !form.time) {
      setStatus("❌ Please provide both date and time for the event.");
      return;
    }
    if (!form.meetLink) {
      setStatus("❌ Please provide a meeting link.");
      return;
    }
    if (
      (form.platform === "gmeet" && !form.meetLink.startsWith("https://meet.google.com/")) ||
      (form.platform === "zoom" && !form.meetLink.startsWith("https://zoom.us/j/"))
    ) {
      setStatus(
        `❌ Invalid ${form.platform === "gmeet" ? "Google Meet" : "Zoom"} link format.`
      );
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Preparing transaction...");
      const idToken = await user.getIdToken();
      const balance = await wallet.getBalance();
      const lovelace = balance.find((asset) => asset.unit === "lovelace")?.quantity || "0";
      if (parseInt(lovelace) < 10_000_000) {
        throw new Error("Insufficient balance. You need at least 10 ADA to mint an event NFT.");
      }
      const usedAddresses = await wallet.getUsedAddresses();
      const address = usedAddresses[0] || walletAddress;
      const assetName = stringToHex(form.name || `EventNFT-${Date.now()}`);
      const eventDateTime = `${form.date}T${form.time}:00`;
      const metadata = {
        721: {
          [policyId]: {
            [assetName]: {
              name: form.name.slice(0, 64) || "Event NFT",
              description: form.description.slice(0, 64) || "An event NFT on Cardano",
              image: uploadInfo.cid.slice(0, 64),
              mediaType: "image/jpeg",
              creator: user.uid,
              eventDateTime,
              meetLink: form.meetLink.slice(0, 64) || "",
              timezone: form.timezone,
              tags: form.tags
                ? form.tags.split(",").map((tag) => tag.trim().slice(0, 64)).slice(0, 10)
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
      tx.sendLovelace(paymentRecipient, "10000000");
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
      const eventId = uuidv4(); 
      const nftData = {
        id: eventId,
        creator: address,
        fee: form.fee,
        title: form.name,
        description: form.description,
        image: form.image,
        cid: uploadInfo.cid,
        link: form.meetLink,
        time: eventDateTime,
        timestamp: new Date().toISOString(),
        assetName: form.name, 
        policyId: asset.policyId,
      };

      await setDoc(doc(db, "nft-images", eventId), nftData); 
      const txLink = `https://preview.cexplorer.io/tx/${txHash}`;
      const shortTxHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
      setStatus(
        <>
          ✅ Event Created! <span className="font-mono">{shortTxHash}</span>{" "}
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
      console.error("Minting error:", error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (imageUrl) => {
    if (!imageUrl) {
      return (
        <div className="mt-2 h-32 bg-gray-200 flex items-center justify-center text-gray-600 border rounded">
          <span>No Image Selected</span>
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
      <div className="mt-2 relative h-32">
        <img
          src={src}
          alt="Uploaded preview"
          className="h-full w-full object-contain border rounded"
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
          className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-600 border rounded"
          style={{ display: "none" }}
        >
          <span>Failed to load image</span>
        </div>
      </div>
    );
  };

  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return null;
  }

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
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            className="bg-transparent animate-pulse rounded-full inline-flex items-center gap-2 text-gray-600 justify-center"
            href="/"
          >
            <BsArrowLeft className="text-xs" />
            <span className={`font-semibold ${geistTeko.variable}`}>Create Your Event NFT</span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            <span className="text-gray-900">Mint Your</span>{" "}
            <span className="text-green-500">Event NFT</span>
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Create Event NFTs for your events for a fee of 10 ADA.
          </p>

          <div className="space-y-4 text-left">
            {[
              "name",
              "image",
              "date",
              "time",
              "timezone",
              "platform",
              "meetLink",
              "description",
              "fee",
              "tags",
            ].map((field) => (
              <div className="form-control" key={field}>
                <label className="label text-black capitalize">
                  {field === "meetLink"
                    ? `${form.platform === "zoom" ? "Zoom" : "Google Meet"} Link`
                    : field === "platform"
                    ? "Meeting Platform"
                    : field}
                </label>
                {field === "image" ? (
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleImageUpload}
                      className="file-input file-input-bordered w-full bg-transparent"
                      disabled={loading}
                    />
                    {form.image && <>{renderImage(form.image)}</>}
                    {loading && (
                      <div className="mt-2 flex justify-center">
                        <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ) : field === "platform" ? (
                  <select
                    name={field}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="select select-bordered w-full bg-transparent"
                    disabled={loading}
                  >
                    <option value="gmeet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                  </select>
                ) : field === "timezone" ? (
                  <select
                    name={field}
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="select select-bordered w-full bg-transparent"
                    disabled={loading}
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      field === "date"
                        ? "date"
                        : field === "time"
                        ? "time"
                        : field === "meetLink"
                        ? "url"
                        : "text"
                    }
                    name={field}
                    placeholder={
                      field === "date" || field === "time"
                        ? ""
                        : field === "meetLink"
                        ? form.platform === "zoom"
                          ? "https://zoom.us/j/..."
                          : "https://meet.google.com/..."
                        : `Enter ${field}`
                    }
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="input input-bordered w-full bg-transparent"
                    disabled={loading}
                  />
                )}
              </div>
            ))}

            <button
              onClick={() => setShowWalletModal(true)}
              className="btn border border-black text-white hover:bg-black hover:text-white w-full mt-4 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FaWallet />
              {walletAddress
                ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </button>

            {walletAddress && (
              <button
                onClick={handleSignMinter}
                className="btn bg-black text-white border-none hover:bg-gray-800 w-full mt-2"
                disabled={loading}
              >
                {loading ? "Minting..." : "Mint NFT (10 ADA)"}
              </button>
            )}

            {status && (
              <div className="alert alert-info mt-2">
                <span>{status}</span>
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
                disabled={loading}
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
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
