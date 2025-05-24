import type { NextApiRequest, NextApiResponse } from "next";
import { Lucid, Blockfrost, Data } from "lucid-cardano";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config";
import { initSync } from "lucid-cardano";
import * as wasm from "cardano-multiplatform-lib-nodejs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questId, userAddress, walletApi } = req.body;

  try {
    // Initialize WASM
    initSync(wasm);

    // Initialize Lucid
    const lucid = await Lucid.new(
      new Blockfrost("https://cardano-testnet.blockfrost.io/api/v0", process.env.BLOCKFROST_API_KEY),
      "Testnet"
    );
    lucid.selectWallet(walletApi); // Use wallet API (e.g., Nami)

    // Load reward pool script
    const rewardPoolScript = {
      type: "PlutusV2",
      script: process.env.REWARD_POOL_SCRIPT!,
    };
    const scriptAddress = lucid.utils.validatorToAddress(rewardPoolScript);

    // Fetch quest data
    const questRef = doc(db, "quests", questId);
    const questSnap = await getDoc(questRef);
    if (!questSnap.exists()) {
      return res.status(404).json({ error: "Quest not found" });
    }
    const questData = questSnap.data();

    // Fetch current datum
    const utxos = await lucid.utxosAt(scriptAddress);
    const utxo = utxos.find((u) => u.datum);
    if (!utxo || !utxo.datum) {
      return res.status(400).json({ error: "No UTxO with datum found at script address" });
    }

    // Parse current datum
    const currentDatum = Data.from(utxo.datum);
    const allocated = currentDatum.eligible_addresses.get(Buffer.from(userAddress, "hex")) || BigInt(0);
    if (allocated === BigInt(0)) {
      return res.status(403).json({ error: "Address not eligible for claiming" });
    }

    // Update datum
    const updatedEligibleAddresses = new Map(currentDatum.eligible_addresses);
    updatedEligibleAddresses.delete(Buffer.from(userAddress, "hex"));
    const newDatum = {
      ...currentDatum,
      eligible_addresses: updatedEligibleAddresses,
    };

    // Build transaction
    const redeemer = Data.to({ Claim: { address: Buffer.from(userAddress, "hex") } });
    const tx = await lucid
      .newTx()
      .collectFrom([utxo], redeemer)
      .payToAddress(userAddress, {
        [questData.tokenPolicyId + Buffer.from(questData.tokenName, "utf8").toString("hex")]: allocated,
      })
      .payToContract(scriptAddress, { inline: Data.to(newDatum) }, {})
      .validTo(Date.now() + 100000)
      .complete();

    // Sign and submit
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return res.status(200).json({ txHash, message: `Claimed ${allocated} tokens` });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}