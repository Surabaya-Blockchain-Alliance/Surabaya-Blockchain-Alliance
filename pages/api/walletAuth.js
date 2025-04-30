// pages/api/walletAuth/index.js
import { generateNonce } from '@meshsdk/core';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid wallet address' });
  }

  try {
    const nonce = generateNonce('Connect to Cardano Hub Indonesia');

    await db.doc(`users/${walletAddress}`).set(
      {
        nonce,
        status: 'connected',
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
