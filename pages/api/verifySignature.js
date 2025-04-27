import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseAdmin from 'firebase-admin';  
import { verifyMessage } from 'cardano-serialization-lib'; // You may need to install this or another Cardano verification library

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

  const { walletAddress, signature, message } = req.body;
  
  if (!walletAddress || !signature || !message) {
    return res.status(400).json({ error: 'Missing wallet address, signature, or message' });
  }

  try {
    // Step 1: Verify the signed message using the Cardano library
    const isValid = verifyMessage(message, signature, walletAddress); // Use Cardano's method to verify the message

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature or message' });
    }

    // Step 2: Check if wallet address is already registered in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('walletAddress', '==', walletAddress));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Wallet not registered' });
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // Step 3: Create a Firebase custom token for the authenticated user
    const customToken = await adminAuth.createCustomToken(userId);
    
    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error processing wallet login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
