import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../../config";
import { BrowserWallet, Transaction, ForgeScript } from "@meshsdk/core";
import { useRouter } from "next/router";

export default function ClaimNFTPage() {
  const [status, setStatus] = useState("");
  const router = useRouter();
  const { id } = router.query;

  const handleClaimNFT = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const joinDocRef = doc(db, `nft-images/${id}/joined`, user.uid);
      const joinDocSnap = await getDoc(joinDocRef);
      if (!joinDocSnap.exists() || !joinDocSnap.data().nftClaimEligible) {
        throw new Error("Not eligible to claim NFT");
      }

      const wallet = await BrowserWallet.enable("nami");
      const walletAddress = await wallet.getChangeAddress();
      const eventDocRef = doc(db, "nft-images", id);
      const eventSnap = await getDoc(eventDocRef);
      const event = eventSnap.data();

      const tx = new Transaction({ initiator: wallet });
      tx.mintAsset(ForgeScript.withOneSignature(walletAddress), {
        assetName: event.assetName,
        assetQuantity: "1",
        metadata: {
          721: {
            [event.policyId]: {
              [event.assetName]: {
                name: event.title,
                description: event.description,
                image: event.cid,
              },
            },
          },
        },
        label: "721",
        recipient: walletAddress,
      });

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      await updateDoc(joinDocRef, { nftClaimed: true, nftClaimTxHash: txHash });
      setStatus(`✅ NFT claimed! Tx: ${txHash}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleClaimNFT}>Claim NFT</button>
      {status && <p>{status}</p>}
    </div>
  );
}