import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseAdmin from 'firebase-admin';  

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const adminAuth = firebaseAdmin.auth();  

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Missing wallet address' });
  }

  try {

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('walletAddress', '==', walletAddress));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Wallet not registered' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    const customToken = await adminAuth.createCustomToken(userId);
    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error checking wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
