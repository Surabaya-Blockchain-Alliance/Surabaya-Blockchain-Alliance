import { generateNonce } from '@meshsdk/core';
import admin from 'firebase-admin';
import { checkSignature } from '@meshsdk/core';

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
    console.log('Received request:', req.body);
    const docRef = db.collection('WalletAuth').doc(walletAddress);
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

    const usersQuery = await db.collection('users')
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();

    let uid = walletAddress;
    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      uid = userDoc.data().uid;
    }
    const token = await admin.auth().createCustomToken(uid);
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error verifying and generating token:', error);
    return res.status(500).json({ error: 'Token generation error' });
  }
}
