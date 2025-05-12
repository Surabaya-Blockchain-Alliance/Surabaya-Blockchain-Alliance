import { getLucidInstance } from "../../firebase/lucid.js";

export default async function handler(req, res) {
  const { address } = req.query;

  try {
    const lucid = await getLucidInstance();
    const utxos = await lucid.utxosAt(address);
    
    if (!utxos || utxos.length === 0) {
      return res.status(404).json({ error: "No UTXOs found" });
    }

    const ref = `${utxos[0].txHash}#${utxos[0].outputIndex}`;
    res.status(200).json({ utxo: ref });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
