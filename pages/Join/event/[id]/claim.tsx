import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../../config";
import { Transaction, ForgeScript, BrowserWallet } from "@meshsdk/core";
import { useRouter } from "next/router";
import { Teko } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FaCheckCircle } from "react-icons/fa";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { uploadFile } from "@/utils/upload";
import ConnectWallet from "@/components/button/ConnectWallet";

const geistTeko = Teko({
  variable: "--font-geist-teko",
  subsets: ["latin"],
});

export default function ClaimNFTPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [certificateCid, setCertificateCid] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  const certificateRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser && id) {
        router.push("/signin");
      } else {
        fetchData(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const fetchData = async (user) => {
    if (!id || !user) return;

    try {
      setLoading(true);
      const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
      const joinDocSnap = await getDoc(joinDocRef);
      if (!joinDocSnap.exists() || !joinDocSnap.data().nftClaimEligible) {
        throw new Error("Not eligible to claim NFT");
      }

      const joinData = joinDocSnap.data();
      setMetadata(joinData.metadata || {});

      const eventDocRef = doc(db, "nft-images", id);
      const eventSnap = await getDoc(eventDocRef);
      if (!eventSnap.exists()) throw new Error("Event not found");
      setEvent(eventSnap.data());

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const generateCertificateImage = async () => {
    if (!certificateRef.current) return null;

    try {
      const computedStyles = window.getComputedStyle(certificateRef.current);
      console.log("Computed backgroundColor:", computedStyles.backgroundColor);
      console.log("Computed backgroundImage:", computedStyles.backgroundImage);
      console.log("Computed color:", computedStyles.color);
      for (const prop of computedStyles) {
        const value = computedStyles.getPropertyValue(prop);
        if (value.includes("oklch")) {
          console.log(`Found oklch in ${prop}:`, value);
        }
      }

      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          logging: true,
        });
        const image = canvas.toDataURL("image/png");
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "certificate.png", { type: "image/png" });
        const { gatewayUrl } = await uploadFile(file);
        return gatewayUrl;
      } catch (html2canvasError) {
        console.warn("html2canvas failed, falling back to dom-to-image:", html2canvasError);
        const image = await domtoimage.toPng(certificateRef.current, {
          quality: 1,
          width: certificateRef.current.offsetWidth * 2,
          height: certificateRef.current.offsetHeight * 2,
        });
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "certificate.png", { type: "image/png" });
        const { gatewayUrl } = await uploadFile(file);
        return gatewayUrl;
      }
    } catch (error) {
      console.error("Error generating certificate image:", error);
      throw new Error("Failed to generate certificate image");
    }
  };

const handleClaimNFT = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!walletAddress) throw new Error("Please connect your wallet");

    const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
    const joinDocSnap = await getDoc(joinDocRef);
    if (!joinDocSnap.exists() || !joinDocSnap.data().nftClaimEligible) {
      throw new Error("Not eligible to claim NFT");
    }

    setStatus("⏳ Generating certificate image...");
    const certCid = await generateCertificateImage();
    if (!certCid) throw new Error("Failed to generate certificate image");
    setCertificateCid(certCid);

    const wallet = await BrowserWallet.enable("nami");
    const usedAddresses = await wallet.getUsedAddresses();
    const connectedAddress = usedAddresses[0] || (await wallet.getChangeAddress());

    if (walletAddress !== connectedAddress) {
      throw new Error("Connected wallet address does not match with the join record");
    }

    const balance = await wallet.getBalance();
    const lovelace = balance.find((asset) => asset.unit === "lovelace")?.quantity || "0";
    if (parseInt(lovelace) < 2_000_000) {
      throw new Error("Insufficient balance. At least 2 ADA required.");
    }

    const certificateMetadata = {
      certificateName: `Participation Certificate for ${event.title}`,
      username: metadata.username || "Anonymous",
      eventHeld: new Date(event.time).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: event.timezone || "UTC",
      }),
      role: "peserta",
      attestation: metadata.attestation || "N/A",
      merkleTreeProof: metadata.merkleTreeProof || "N/A",
    };

    const assetNameHex = stringToHex(event.assetName);
    const tx = new Transaction({ initiator: wallet });

    tx.mintAsset(ForgeScript.withOneSignature(walletAddress), {
      assetName: event.assetName,
      assetQuantity: "1",
      metadata: {
        721: {
          [event.policyId]: {
            [event.assetName]: {
              name: event.title.slice(0, 64),
              description: event.description.slice(0, 64),
              image: certCid,
              mediaType: "image/png",
              ...certificateMetadata,
            },
          },
        },
      },
      label: "721",
      recipient: walletAddress,
    });

    setStatus("⏳ Building transaction...");
    const unsignedTx = await tx.build();
    setStatus("✍️ Signing transaction...");
    const signedTx = await wallet.signTx(unsignedTx);
    setStatus("📤 Submitting transaction...");
    const txHash = await wallet.submitTx(signedTx);

    setStatus("⏳ Waiting for confirmation...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    await updateDoc(joinDocRef, { nftClaimed: true, nftClaimTxHash: txHash });
    setStatus(`✅ NFT claimed successfully! Tx Hash: ${txHash}`);
  } catch (error) {
    console.error("Error claiming NFT:", error);
    setStatus(`❌ Error: ${error.message}`);
  }
};


  const bgImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

  if (loading) {
    return (
      <div
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          color: "#000000",
        }}
      >
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.7)", position: "absolute", inset: 0, zIndex: 0 }}></div>
        <Navbar />
        <main style={{ flexGrow: 1, width: "100%", textAlign: "center", padding: "5rem 1.5rem", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg style={{ animation: "spin 1s linear infinite", height: "2rem", width: "2rem", color: "#4b5563" }} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
            </svg>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event || !metadata) {
    return (
      <div
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          color: "#000000",
        }}
      >
        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.7)", position: "absolute", inset: 0, zIndex: 0 }}></div>
        <Navbar />
        <main style={{ flexGrow: 1, width: "100%", textAlign: "center", padding: "5rem 1.5rem", position: "relative", zIndex: 10 }}>
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "0.5rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <span>{error || "Event or metadata not found."}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#000000",
      }}
    >
      <div style={{ backgroundColor: "rgba(255, 255, 255, 0.7)", position: "absolute", inset: 0, zIndex: 0 }}></div>
      <Navbar />
      <main style={{ flexGrow: 1, width: "100%", textAlign: "center", padding: "5rem 1.5rem", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h1
            style={{
              fontFamily: geistTeko.variable,
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "#1e40af",
            }}
          >
            Claim Your NFT Certificate for {event.title}
          </h1>

          <ConnectWallet onConnect={handleWalletConnect} />

          <div
            ref={certificateRef}
            style={{
              all: "initial", 
              fontFamily: geistTeko.variable,
              backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              backgroundColor: "#ffffff",
              border: "4px solid #facc15",
              borderRadius: "0.5rem",
              padding: "2rem",
              boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
              position: "relative",
              width: "600px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                fontFamily: geistTeko.variable,
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#1e40af",
                textAlign: "center",
              }}
            >
              Certificate of Participation
            </h2>
            <p
              style={{
                fontFamily: "inherit",
                textAlign: "center",
                fontSize: "1.125rem",
                color: "#4b5563",
              }}
            >
              This certifies that
            </p>
            <h3
              style={{
                fontFamily: geistTeko.variable,
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              {metadata.username || "Anonymous"}
            </h3>
            <p
              style={{
                fontFamily: "inherit",
                textAlign: "center",
                fontSize: "1.125rem",
                color: "#4b5563",
              }}
            >
              participated as a <span style={{ fontWeight: "bold" }}>peserta</span> in
            </p>
            <h4
              style={{
                fontFamily: geistTeko.variable,
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              {event.title}
            </h4>
            <p
              style={{
                fontFamily: "inherit",
                textAlign: "center",
                fontSize: "1.125rem",
                color: "#4b5563",
              }}
            >
              Held on{" "}
              {new Date(event.time).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: event.timezone || "UTC",
              })}
            </p>
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                color: "#facc15",
                fontSize: "2.25rem",
              }}
            >
              🏆
            </div>
            <div
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                color: "#facc15",
                fontSize: "2.25rem",
              }}
            >
              🏆
            </div>
          </div>

          <button
            onClick={handleClaimNFT}
            style={{
              width: "100%",
              maxWidth: "28rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              margin: "1rem auto 0",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              cursor: walletAddress ? "pointer" : "not-allowed",
              opacity: walletAddress ? 1 : 0.5,
              border: "none",
            }}
            disabled={!walletAddress}
          >
            <FaCheckCircle />
            Claim NFT Certificate
          </button>
          {status && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: status.startsWith("✅") ? "#dcfce7" : "#fee2e2",
                color: status.startsWith("✅") ? "#15803d" : "#b91c1c",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span>{status}</span>
            </div>
          )}
          {certificateCid && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                Certificate Image:
              </p>
              <img
                src={certificateCid}
                alt="Certificate"
                style={{
                  maxWidth: "28rem",
                  margin: "0 auto",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
