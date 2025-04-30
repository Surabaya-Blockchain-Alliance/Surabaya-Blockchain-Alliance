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

  if (!walletAddress || !signature || !nonce || !key) {
    return res.status(400).json({ error: 'Missing walletAddress, signature, key, or nonce' });
  }

  try {
    const docRef = db.collection('users').doc(walletAddress);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Nonce not found for this wallet' });
    }

    const storedNonce = snapshot.data().nonce;
    if (storedNonce !== nonce) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    const isValid = checkSignature(nonce, { key, signature }, walletAddress);

    if (!isValid) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    await docRef.set({ nonce: '' }, { merge: true });

    return res.status(200).json({ message: 'Wallet verified successfully' });
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return res.status(500).json({ error: 'Verification error' });
  }
}
