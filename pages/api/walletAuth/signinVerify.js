import { checkSignature } from '@meshsdk/core';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress, signature, key, nonce } = req.body;

  // Validate the required fields
  if (!walletAddress || !signature || !nonce || !key) {
    return res.status(400).json({ error: 'Missing walletAddress, signature, key, or nonce' });
  }

  try {
    // Step 1: Retrieve the stored nonce for this walletAddress from Firestore
    const docRef = db.collection('WalletAuth').doc(walletAddress);
    const snapshot = await docRef.get();

    // Check if the nonce exists for this walletAddress
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Nonce not found for this wallet' });
    }

    const storedNonce = snapshot.data().nonce;

    // Step 2: Verify the nonce received with the stored nonce
    if (storedNonce !== nonce) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // Step 3: Verify the signature
    const isValid = checkSignature(nonce, { key, signature }, walletAddress);
    if (!isValid) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Step 4: Reset the nonce in Firestore after successful verification
    await docRef.set({ nonce: '' }, { merge: true });

    // Step 5: Retrieve user info associated with this walletAddress
    const usersQuery = await db.collection('users')
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();

    let uid = walletAddress;  // Fallback to using walletAddress if no user is found

    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      uid = userDoc.data().uid;  // Use the uid from the user document
    }

    // Step 6: Generate a Firebase custom token for the user
    const token = await admin.auth().createCustomToken(uid);

    // Step 7: Return the token to the client
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error verifying and generating token:', error);
    return res.status(500).json({ error: 'Token generation error' });
  }
}
