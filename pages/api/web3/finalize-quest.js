import type { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "@/config";
import { MeshTxBuilder } from "@meshsdk/core";
import { BlockfrostProvider } from "@meshsdk/provider";

interface UserProgress {
  userId: string;
  totalPoints: number;
  userWallet: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questId, userId } = req.body;

  try {
    // Validate request body
    if (!questId || !userId) {
      return res.status(400).json({ error: "Quest ID and user ID are required" });
    }

    // Fetch quest data
    const questRef = doc(db, "quests", questId);
    const questSnap = await getDoc(questRef);
    if (!questSnap.exists()) {
      return res.status(404).json({ error: "Quest not found" });
    }
    const questData = questSnap.data();

    // Verify the requester is the quest creator
    if (questData.creatorUid !== userId) {
      return res.status(403).json({ error: "Only the quest creator can finalize the quest" });
    }

    // Check if quest has ended
    const endDate = new Date(questData.endDate);
    if (new Date() < endDate) {
      return res.status(400).json({ error: "Quest has not yet ended" });
    }

    // Check if quest is already finalized
    if (questData.status === "ended") {
      return res.status(400).json({ error: "Quest is already finalized" });
    }

    // Initialize Mesh SDK
    const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!, {
      baseUrl: "https://cardano-preview.blockfrost.io/api/v0",
    });

    // Fetch user progress
    const userProgressCollection = collection(db, "quests", questId, "userProgress");
    const userProgressSnapshot = await getDocs(userProgressCollection);
    const userProgressList: UserProgress[] = userProgressSnapshot.docs.map((doc) => ({
      userId: doc.id,
      totalPoints: doc.data().totalPoints || 0,
      userWallet: doc.data().userWallet || "",
    }));

    // Calculate total points
    const totalPoints = userProgressList.reduce((sum, user) => sum + user.totalPoints, 0);
    if (totalPoints === 0) {
      return res.status(400).json({ error: "No users have completed tasks" });
    }

    // Calculate token allocations
    const totalReward = questData.reward;
    const allocations = userProgressList
      .filter((user) => user.userWallet && user.totalPoints > 0)
      .map((user) => ({
        address: user.userWallet,
        amount: Math.floor((user.totalPoints / totalPoints) * totalReward),
      }));

    if (allocations.length === 0) {
      return res.status(400).json({ error: "No eligible users with valid wallet addresses" });
    }

    // Generate unsigned transactions for each allocation
    const unsignedTxs: string[] = [];
    const scriptAddress = questData.scriptAddress;
    let currentDatum = { Map: [] }; // Initial datum

    for (const { address, amount } of allocations) {
      if (amount <= 0) continue;

      const txBuilder = new MeshTxBuilder({ fetcher: blockfrostProvider });
      const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);
      if (!utxos.length) {
        throw new Error("No UTxOs found at script address");
      }
      const utxo = utxos[0];

      // Update datum
      currentDatum.Map.push({ k: address, v: amount.toString() });

      await txBuilder
        .spendingPlutusScriptV2()
        .txIn(utxo.txHash, utxo.outputIndex)
        .txInScript(JSON.parse(process.env.REWARD_POOL_SCRIPT!))
        .txInRedeemerValue("Update")
        .txOut(scriptAddress, utxo.assets)
        .txOutDatumEmbedValue(JSON.stringify(currentDatum))
        .changeAddress(questData.adminWalletAddress)
        .complete();

      unsignedTxs.push(txBuilder.txHex);
    }

    // Update quest status to "ended"
    await updateDoc(questRef, { status: "ended" });

    return res.status(200).json({
      message: `Prepared ${unsignedTxs.length} transactions for signing`,
      unsignedTxs,
    });
  } catch (error: any) {
    console.error("Finalize quest error:", error);
    return res.status(500).json({ error: error.message });
  }
}