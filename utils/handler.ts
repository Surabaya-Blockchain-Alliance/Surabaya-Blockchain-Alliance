import {
  MeshTxBuilder,
  MeshWallet,
  BlockfrostProvider,
  Script,
  resolveScriptHash,
} from "@meshsdk/core";

// Blockfrost configuration
const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_KEY;
if (!BLOCKFROST_API_KEY) {
  throw new Error("NEXT_PUBLIC_BLOCKFROST_KEY is not set in environment variables");
}

const NETWORK = "preview"; // Use "Mainnet" for production
const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_API_KEY, NETWORK === "preview" ? 1 : 0);
const PLUTUS_SCRIPT_CBOR = "your_aiken_compiled_cbor";

// Initialize Mesh wallet
async function initializeMeshWallet(walletApi: any): Promise<MeshWallet> {
  const wallet = new MeshWallet({
    networkId: NETWORK === "preview" ? 1 : 0, // 0 for Preview/Preprod, 1 for Mainnet
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
    key: { type: "api", api: walletApi },
  });
  return wallet;
}

async function initializeRewardPool(
  walletApi: any,
  totalRewards: number,
  deadline: number,
  tokenPolicyId: string,
  tokenName: string
): Promise<{ txHash: string; scriptAddress: string }> {
  const wallet = await initializeMeshWallet(walletApi);
  const ownerAddress = await wallet.getChangeAddress();
  const ownerPkh = wallet.getPaymentCredential().hash;

  const datum = {
    alternative: 0,
    fields: [
      ownerPkh,
      {
        alternative: 0,
        fields: [
          tokenPolicyId, 
          Buffer.from(tokenName, "utf8").toString("hex"), 
        ],
      },
      BigInt(totalRewards), // total_rewards
      BigInt(deadline), // deadline
      { alternative: 0, fields: [] }, // eligible (empty map)
    ],
  };

  // Plutus script
  const script: Script = {
    code: PLUTUS_SCRIPT_CBOR,
    version: "V2",
  };

  // Derive script address
  const scriptHash = resolveScriptHash(script.code, script.version);
  const scriptAddress = NETWORK === "preview"
    ? `addr1${scriptHash}`
    : `addr_test1${scriptHash}`; // Simplified for Preview

  // Build transaction
  const txBuilder = new MeshTxBuilder({
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
  });

  await txBuilder
    .txOut(scriptAddress, [
      { unit: "lovelace", quantity: "2000000" }, // Minimum ADA
      { unit: tokenPolicyId + Buffer.from(tokenName, "utf8").toString("hex"), quantity: totalRewards.toString() },
    ])
    .txOutInlineDatumValue(datum, "JSON")
    .changeAddress(ownerAddress)
    .complete();

  // Sign and submit
  const signedTx = await wallet.signTx(txBuilder.completeSync());
  const txHash = await wallet.submitTx(signedTx);

  return { txHash, scriptAddress };
}

// Add eligible address
async function addEligibleAddress(
  walletApi: any,
  scriptAddress: string,
  userAddress: string,
  rewardAmount: number
): Promise<string> {
  const wallet = await initializeMeshWallet(walletApi);
  const ownerAddress = await wallet.getChangeAddress();

  // Fetch UTxO at script address
  const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);
  if (!utxos.length) throw new Error("No UTxO found at script address");

  const utxo = utxos[0]; // Assume one UTxO for simplicity
  const oldDatum = JSON.parse(utxo.inlineDatum);

  // Update datum with new eligible address
  const userPkh = MeshWallet.getPaymentCredentialFromAddress(userAddress).hash;
  const newEligible = [
    ...oldDatum.fields[4].fields,
    { alternative: 0, fields: [userPkh, BigInt(rewardAmount)] },
  ];

  const newDatum = {
    ...oldDatum,
    fields: [
      ...oldDatum.fields.slice(0, 4),
      { alternative: 0, fields: newEligible },
    ],
  };

  // Redeemer for AddEligible
  const redeemer = {
    alternative: 0,
    fields: [
      { alternative: 0, fields: [userPkh] },
      BigInt(rewardAmount),
    ],
  };

  // Plutus script
  const script: Script = {
    code: PLUTUS_SCRIPT_CBOR,
    version: "V2",
  };

  // Build transaction
  const txBuilder = new MeshTxBuilder({
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
  });

  await txBuilder
    .spendingPlutusScriptV2()
    .txIn(utxo.txHash, utxo.outputIndex)
    .txInInlineDatumPresent()
    .txInRedeemerValue(redeemer, "JSON")
    .txOut(scriptAddress, utxo.amount)
    .txOutInlineDatumValue(newDatum, "JSON")
    .changeAddress(ownerAddress)
    .complete();

  // Sign and submit
  const signedTx = await wallet.signTx(txBuilder.completeSync());
  const txHash = await wallet.submitTx(signedTx);

  return txHash;
}

// Claim reward
async function claimReward(walletApi: any, scriptAddress: string): Promise<string> {
  const wallet = await initializeMeshWallet(walletApi);
  const userAddress = await wallet.getChangeAddress();
  const userPkh = wallet.getPaymentCredential().hash;

  // Fetch UTxO at script address
  const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);
  if (!utxos.length) throw new Error("No UTxO found at script address");

  const utxo = utxos[0];
  const oldDatum = JSON.parse(utxo.inlineDatum);

  // Find user's reward
  const rewardEntry = oldDatum.fields[4].fields.find(
    (entry: any) => entry.fields[0] === userPkh
  );
  if (!rewardEntry) throw new Error("Not eligible for reward");

  const reward = BigInt(rewardEntry.fields[1]);
  const tokenPolicyId = oldDatum.fields[1].fields[0];
  const tokenName = oldDatum.fields[1].fields[1];

  // Update datum
  const newEligible = oldDatum.fields[4].fields.filter(
    (entry: any) => entry.fields[0] !== userPkh
  );
  const newDatum = {
    ...oldDatum,
    fields: [
      ...oldDatum.fields.slice(0, 2),
      BigInt(oldDatum.fields[2]) - reward, // Update total_rewards
      oldDatum.fields[3],
      { alternative: 0, fields: newEligible },
    ],
  };

  // Redeemer for Claim
  const redeemer = { alternative: 1, fields: [] };

  // Plutus script
  const script: Script = {
    code: PLUTUS_SCRIPT_CBOR,
    version: "V2",
  };

  // Build transaction
  const txBuilder = new MeshTxBuilder({
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
  });

  await txBuilder
    .spendingPlutusScriptV2()
    .txIn(utxo.txHash, utxo.outputIndex)
    .txInInlineDatumPresent()
    .txInRedeemerValue(redeemer, "JSON")
    .txOut(userAddress, [
      { unit: tokenPolicyId + tokenName, quantity: reward.toString() },
    ])
    .txOut(scriptAddress, [
      { unit: "lovelace", quantity: utxo.amount.find((a: any) => a.unit === "lovelace").quantity },
      {
        unit: tokenPolicyId + tokenName,
        quantity: (BigInt(utxo.amount.find((a: any) => a.unit !== "lovelace").quantity) - reward).toString(),
      },
    ])
    .txOutInlineDatumValue(newDatum, "JSON")
    .changeAddress(userAddress)
    .complete();

  // Sign and submit
  const signedTx = await wallet.signTx(txBuilder.completeSync());
  const txHash = await wallet.submitTx(signedTx);

  return txHash;
}

// Withdraw remaining tokens
async function withdrawRewards(walletApi: any, scriptAddress: string): Promise<string> {
  const wallet = await initializeMeshWallet(walletApi);
  const ownerAddress = await wallet.getChangeAddress();

  // Fetch UTxO at script address
  const utxos = await blockfrostProvider.fetchAddressUTxOs(scriptAddress);
  if (!utxos.length) throw new Error("No UTxO found at script address");

  const utxo = utxos[0];
  const datum = JSON.parse(utxo.inlineDatum); // Fixed incomplete line
  const tokenPolicyId = datum.fields[1].fields[0];
  const tokenName = datum.fields[1].fields[1];
  const totalRewards = datum.fields[2];

  // Redeemer for Withdraw
  const redeemer = { alternative: 2, fields: [] };

  // Plutus script
  const script: Script = {
    code: PLUTUS_SCRIPT_CBOR,
    version: "V2",
  };

  // Build transaction
  const txBuilder = new MeshTxBuilder({
    fetcher: blockfrostProvider,
    submitter: blockfrostProvider,
  });

  await txBuilder
    .spendingPlutusScriptV2()
    .txIn(utxo.txHash, utxo.outputIndex)
    .txInInlineDatumPresent()
    .txInRedeemerValue(redeemer, "JSON")
    .txOut(ownerAddress, [
      { unit: "lovelace", quantity: utxo.amount.find((a: any) => a.unit === "lovelace").quantity },
      { unit: tokenPolicyId + tokenName, quantity: totalRewards.toString() },
    ])
    .changeAddress(ownerAddress)
    .complete();

  // Sign and submit
  const signedTx = await wallet.signTx(txBuilder.completeSync());
  const txHash = await wallet.submitTx(signedTx);

  return txHash;
}

export { initializeRewardPool, addEligibleAddress, claimReward, withdrawRewards };