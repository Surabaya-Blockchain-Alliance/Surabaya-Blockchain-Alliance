import { db } from "../../../config"; 
import { doc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { policyId, assetName, txHash, creator, address } = req.body;
    if (!policyId || !assetName || !txHash || !creator || !address) {
      return res.status(400).json({
        error: "Missing required fields: policyId, assetName, txHash, creator, and address are required",
      });
    }

    // 🔒 IMPORTANT:
    // Since you're not verifying ID token server-side, you're trusting the client
    // So just make sure creator is present
    const nftDocId = `${policyId}${assetName}`;

    console.log("Storing NFT data:", {
      policyId,
      assetName,
      txHash,
      creator,
      address,
    });

    await setDoc(doc(db, "nft-images", nftDocId), {
      policyId,
      assetName,
      txHash,
      creator,
      address,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "NFT stored successfully" });
  } catch (error) {
    console.error("Error storing NFT:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
