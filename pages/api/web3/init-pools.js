import type { NextApiRequest, NextApiResponse } from "next";
import { MeshTxBuilder, MeshWallet } from "@meshsdk/core";
import { BlockfrostProvider } from "@meshsdk/provider";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { questId, tokenPolicyId, tokenName, reward, adminWalletAddress } = req.body;

  try {
    if (!questId || !tokenPolicyId || !tokenName || !reward || !adminWalletAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Initialize Mesh SDK with Blockfrost
    const blockfrostProvider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY!, {
      baseUrl: "https://cardano-preview.blockfrost.io/api/v0",
    });

    // Initialize MeshTxBuilder
    const txBuilder = new MeshTxBuilder({ fetcher: blockfrostProvider });

    // Load Plutus script (assumed to be a JSON string in env)
    const script = JSON.parse(process.env.REWARD_POOL_SCRIPT!);
    const scriptAddress = adminWalletAddress; // Simplified; use script credential in production

    // Create empty datum (Map for eligible_addresses)
    const datum = { Map: [] }; // Mesh SDK expects JSON-like Plutus data

    // Build transaction to lock tokens
    const asset = {
      unit: `${tokenPolicyId}${Buffer.from(tokenName).toString("hex")}`,
      quantity: reward.toString(),
    };

    await txBuilder
      .txOut(scriptAddress, [asset])
      .txOutDatumEmbedValue(JSON.stringify(datum))
      .changeAddress(adminWalletAddress) // Fallback change to admin wallet
      .complete();

    // Serialize transaction for frontend signing
    const unsignedTx = txBuilder.txHex;

    return res.status(200).json({ unsignedTx, scriptAddress });
  } catch (error: any) {
    console.error("Initialize reward pool error:", error);
    return res.status(500).json({ error: error.message });
  }
}