import type { NextApiRequest, NextApiResponse } from "next";
import { Lucid, Blockfrost, Data } from "lucid-cardano";
import { initSync } from "lucid-cardano";
import * as wasm from "cardano-multiplatform-lib-nodejs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { questId } = req.query;

  try {
    initSync(wasm);
    const lucid = await Lucid.new(
      new Blockfrost("https://cardano-preview.blockfrost.io/api/v0", process.env.BLOCKFROST_API_KEY),
      "Testnet"
    );
    const rewardPoolScript = {
      type: "PlutusV2",
      script: process.env.REWARD_POOL_SCRIPT!,
    };
    const scriptAddress = lucid.utils.validatorToAddress(rewardPoolScript);

    const utxos = await lucid.utxosAt(scriptAddress);
    const utxo = utxos.find((u) => u.datum);
    if (!utxo || !utxo.datum) {
      return res.status(400).json({ error: "No UTxO with datum found" });
    }

    const datum = Data.from(utxo.datum);
    const rewardsCount = datum.eligible_addresses.size;

    return res.status(200).json({ questId, rewardsCount });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}