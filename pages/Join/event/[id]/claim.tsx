import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../../config";
import { Transaction, ForgeScript, BrowserWallet, stringToHex } from "@meshsdk/core";
import { useRouter } from "next/router";
import { FaCheckCircle, FaEllipsisH, FaEye } from "react-icons/fa";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { uploadFile } from "@/utils/upload";
import ConnectWallet from "@/components/button/ConnectWallet";
import LoadingScreen from "@/components/loading-screen";
import AlertMessage from "@/components/alert-message";
import NFTCertificate from "@/components/tickets/nft";
import CertModal from "@/components/tickets/certificate";
import GlowingRings from "@/components/animated/glowing";

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
  const [open, setOpen] = useState(false);

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
        setStatus("Not eligible to claim NFT");
      }

      const joinData = joinDocSnap.data();
      setMetadata(joinData.metadata || {});

      const eventDocRef = doc(db, "nft-images", id);
      const eventSnap = await getDoc(eventDocRef);
      if (!eventSnap.exists()) setStatus("Event not found");
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
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff', // force white background
        useCORS: true,
        logging: false,
        ignoreElements: (el) => {
          const style = getComputedStyle(el);
          return [...style].some(prop => style.getPropertyValue(prop).includes("oklch"));
        }
      });

      const image = canvas.toDataURL("image/png");
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "certificate.png", { type: "image/png" });
      const { gatewayUrl } = await uploadFile(file);
      return gatewayUrl;

    } catch (html2canvasError) {
      console.warn("html2canvas failed, falling back to dom-to-image:", html2canvasError);
      try {
        const image = await domtoimage.toPng(certificateRef.current, {
          quality: 1,
          width: certificateRef.current.offsetWidth * 2,
          height: certificateRef.current.offsetHeight * 2,
          style: {
            backgroundColor: '#fff',
          }
        });

        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "certificate.png", { type: "image/png" });
        const { gatewayUrl } = await uploadFile(file);
        return gatewayUrl;

      } catch (fallbackError) {
        console.error("Both html2canvas and dom-to-image failed:", fallbackError);
        throw new Error("Failed to generate certificate image");
      }
    }
  };



  // Handler : Claim NFT
  const handleClaimNFT = async () => {
    try {
      const user = auth.currentUser;
      if (!user) setStatus("User not authenticated");
      if (!walletAddress) setStatus("Please connect your wallet");

      const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
      const joinDocSnap = await getDoc(joinDocRef);
      if (!joinDocSnap.exists() || !joinDocSnap.data().nftClaimEligible) {
        setStatus("Not eligible to claim NFT");
      }

      setStatus("⏳ Generating certificate image...");
      const certCid = await generateCertificateImage();
      if (!certCid) setStatus("Failed to generate certificate image");
      setCertificateCid(certCid);

      const wallet = await BrowserWallet.enable("nami");
      const usedAddresses = await wallet.getUsedAddresses();
      const connectedAddress = usedAddresses[0] || (await wallet.getChangeAddress());

      if (walletAddress !== connectedAddress) {
        setStatus("Connected wallet address does not match with the join record");
      }

      const balance = await wallet.getBalance();
      const lovelace = balance.find((asset) => asset.unit === "lovelace")?.quantity || "0";
      if (parseInt(lovelace) < 2_000_000) {
        setStatus("Insufficient balance. At least 2 ADA required.");
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !event || !metadata) {
    return (
      <section className="relative min-h-screen flex flex-col bg-gray-100 text-black overflow-hidden">
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-4xl w-full bg-red-100 text-red-700 p-6 rounded-lg shadow-md text-center">
            <span>{error || "Event not found."}</span>
          </div>
        </div>
      </section>
    );
  }

  const prefix = metadata.attestation.split('-')[1];

  function handlePrint(): void {
    const element = certificateRef.current;
    if (!element) {
      console.error("No content to print.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error("Failed to open print window.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }


  return (
    <section className="min-h-screen flex flex-col justify-start py-20 px-60 text-black bg-white">
      <GlowingRings />
      {status && (
        <div className="px-10 mb-6">
          <AlertMessage message={status} />
        </div>
      )}
      <div className="flex flex-col w-full space-y-6 z-10">
        <div className="flex justify-between items-start w-full">
          <div>
            <h1 className="text-5xl font-extrabold">Congratulations 🏆</h1>
            <p className="text-lg font-normal mt-2">
              You completed event <strong>{event.title}</strong>, claim your NFT below.
            </p>
          </div>
          <div className="flex gap-3">
            <ConnectWallet onConnect={handleWalletConnect} />

            <div className="dropdown dropdown-hover dropdown-end text-black">
              <div tabIndex={0} role="button" className="btn m-1 bg-transparent hover:bg-transparent"><FaEllipsisH /></div>
              {certificateCid && (
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                  <li><button onClick={() => setOpen(true)}><FaEye />Preview</button></li>
                </ul>
              )}
            </div>

          </div>
        </div>

        <NFTCertificate
          ref={certificateRef}
          title={event.title}
          image={"/img/logo.png"}
          description={event.description}
          username={metadata.username || "Anonymous"}
          date={new Date(event.time).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: event.timezone || "UTC" })}
          eventId={prefix}
          reffNumber={metadata.merkleTreeProof}
          organizer={"Cardano Hub Indonesia"} />

        <button
          className={`mx-auto py-3 w-full rounded-lg px-14 text-xl font-bold uppercase text-white transition focus:outline-none focus:ring-4 focus:ring-purple-300
            ${walletAddress
              ? 'cursor-pointer bg-gradient-to-r from-slate-700 to-blue-700 hover:bg-gradient-to-br'
              : 'cursor-not-allowed bg-gray-400'
            }`}
          onClick={handleClaimNFT}
          disabled={!walletAddress}
          aria-label="Claim NFT button"
        >
          <span className="pt-2">{loading ? <span className="loading loading-dots loading-lg"></span> : '🏆 Claim NFT'}</span>
        </button>


        {status.startsWith("✅") && (
          <div className="flex items-center justify-center mt-8 space-x-2 text-green-600">
            <FaCheckCircle size={24} />
            <span className="font-semibold text-lg">{status}</span>
          </div>
        )}

        <CertModal
          isOpen={open}
          onClose={() => setOpen(false)}
          handlePrint={handlePrint}
          imageUrl={certificateCid}
          metadata={"Certificate Image"} />

      </div>
    </section>
  );
}
