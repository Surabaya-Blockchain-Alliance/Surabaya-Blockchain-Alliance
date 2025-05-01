import { checkSignature, generateNonce } from '@meshsdk/core';
import { getApps, initializeApp } from 'firebase/app';
import admin from 'firebase-admin';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

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
const adminAuth = admin.auth();

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid wallet address' });
    }

    try {
      const nonce = generateNonce('Sign to login to Cardano Hub Indonesia: ');

      await db.doc(`WalletAuth/${walletAddress}`).set(
        {
          nonce,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return res.status(200).json({ nonce });
    } catch (err) {
      console.error('Error generating nonce:', err);
      return res.status(500).json({ error: 'Failed to generate nonce' });
    }
  }

  if (method === 'POST') {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: 'Missing walletAddress or signature' });
    }

    try {
      const userRef = db.doc(`WalletAuth/${walletAddress}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { nonce } = userSnap.data();

      const isValid = checkSignature(nonce, signature, walletAddress);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const newNonce = generateNonce('Nonce refreshed: ');
      await userRef.set(
        {
          nonce: newNonce,
          status: 'verified',
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );

      const customToken = await adminAuth.createCustomToken(walletAddress);
      return res.status(200).json({ token: customToken });
    } catch (err) {
      console.error('Error verifying signature:', err);
      return res.status(500).json({ error: 'Failed to verify signature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
