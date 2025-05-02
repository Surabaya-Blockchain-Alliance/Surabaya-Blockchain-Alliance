import { getLucidInstance } from "../../firebase/lucid.js";
import { db } from "../../firebase/firebase.js";
import fs from "fs";
import path from "path";
import { Data, fromText } from "lucid-cardano";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { name, url, image, date, utxoRef, creatorVKHHex, userAddress } = req.body;

    if (!name || !url || !image || !date || !utxoRef || !creatorVKHHex || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lucid = await getLucidInstance();

    const scriptPath = path.join(process.cwd(), "plutus", "event_nft.event_nft.plutus");
    const script = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
    const policyId = lucid.utils.mintingPolicyToId(script);
    const tokenName = fromText(name);
    const unit = policyId + tokenName;

    const datum = Data.to({
      constructor: 0,
      fields: [url, name, image, date, creatorVKHHex],
    });

    const redeemer = Data.to({ constructor: 0, fields: [] });

    const utxos = await lucid.utxosAt(userAddress);
    const selected = utxos.find((u) => `${u.txHash}#${u.outputIndex}` === utxoRef);
    if (!selected) return res.status(404).json({ error: "UTxO not found" });

    const tx = await lucid
      .newTx()
      .collectFrom([selected])
      .attachMintingPolicy(script)
      .mintAssets({ [unit]: 1n }, redeemer)
      .payToAddressWithDatum(userAddress, { [unit]: 1n }, datum)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    await db.collection("nfts").add({
      name,
      url,
      image,
      date,
      creatorVKHHex,
      utxoRef,
      userAddress,
      policyId,
      tokenName: name,
      assetUnit: unit,
      txHash,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({ txHash, policyId, asset: unit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Minting failed", details: err.message });
  }
}
