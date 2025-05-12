import { Lucid } from "lucid-cardano";
import { BrowserWallet } from "@meshsdk/core";

export async function mintNFTWithMesh({ walletId, userAddress, formData }) {
  try {
    const walletApi = await BrowserWallet.enable(walletId);
    const lucid = await Lucid.new(walletApi, "preview"); 
    lucid.selectWallet(walletApi);

    const utxoRes = await fetch(`/api/get-utxo?address=${userAddress}`);
    const { utxo } = await utxoRes.json();
    if (!utxo) throw new Error("UTxO not found.");

    const script = await fetch("/plutus/event_nft.event_nft.plutus").then((res) => res.json());
    const policyId = lucid.utils.mintingPolicyToId(script);
    const tokenName = lucid.utils.fromText(formData.name);
    const unit = policyId + tokenName;

    const datum = lucid.Data.to({
      constructor: 0,
      fields: [formData.url, formData.name, formData.image, formData.date, userAddress],
    });

    const redeemer = lucid.Data.to({ constructor: 0, fields: [] });

    const tx = await lucid
      .newTx()
      .collectFrom([{ txHash: utxo.split("#")[0], outputIndex: parseInt(utxo.split("#")[1]) }])
      .attachMintingPolicy(script)
      .mintAssets({ [unit]: 1n }, redeemer)
      .payToAddressWithDatum(userAddress, { [unit]: 1n }, datum)
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    return { success: true, txHash, policyId, unit };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
