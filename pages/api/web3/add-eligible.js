import type { NextApiRequest, NextApiResponse } from "next";
import { MeshTxBuilder, deserializeTx } from "@meshsdk/core";
import { BlockfrostProvider } from "@meshsdk/provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questId, address, amount, signedTx } = req.body;

  try {
    if (!questId || !address || !amount || !signedTx) {
      return res.status(400).json({ error: "Quest ID, address, amount, and signedTx are required" });
    }

    // Fetch quest data
    const questRef = doc(db, "quests", questId);
    const questSnap = await getDoc(questRef);
    if (!questSnap.exists()) {
      return res.status(404).json({ error: "Quest not found" });
    }
    const questData = questSnap.data();

    // Initialize Mesh SDK
    const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!, {
      baseUrl: "https://cardano-preview.blockfrost.io/api/v0",
    });
    const txBuilder = new MeshTxBuilder({ fetcher: blockfrostProvider });

    // Deserialize signed transaction
    const deserializedTx = deserializeTx(signedTx);

    // Fetch UTxO at script address
    const scriptAddress = questData.scriptAddress;
    const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);
    if (!utxos.length) {
      return res.status(400).json({ error: "No UTxOs found at script address" });
    }
    const utxo = utxos[0];

    // Load current datum (assumed to be a Map)
    const currentDatum = JSON.parse(utxo.datum || '{"Map": []}');

    // Update datum with new address and amount
    const updatedDatum = { Map: [...currentDatum.Map, { k: address, v: amount.toString() }] };

    // Build transaction (for validation)
    await txBuilder
      .spendingPlutusScriptV2()
      .txIn(utxo.txHash, utxo.outputIndex)
      .txInScript(JSON.parse(process.env.REWARD_POOL_SCRIPT!))
      .txInRedeemerValue("Update")
      .txOut(scriptAddress, utxo.assets)
      .txOutDatumEmbedValue(JSON.stringify(updatedDatum))
      .changeAddress(questData.adminWalletAddress)
      .complete();

    // Submit signed transaction
    const txHash = await blockfrostProvider.submitTx(signedTx);

    return res.status(200).json({ message: "Eligible address added", txHash });
  } catch (error: any) {
    console.error("Add eligible error:", error);
    return res.status(500).json({ error: error.message });
  }
}