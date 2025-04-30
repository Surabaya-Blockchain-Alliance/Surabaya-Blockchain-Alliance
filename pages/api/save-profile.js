import { db } from '../../config'; 
import { doc, getDocs, setDoc, query, where } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    uid,
    username,
    discordUsername,
    twitterUsername,
    profileImage,
    walletAddress,
   // nonce,
  } = req.body;

  if (!uid || !username || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const checks = [
      { field: 'username', value: username, label: 'Username' },
      { field: 'discordUsername', value: discordUsername, label: 'Discord Username' },
      { field: 'walletAddress', value: walletAddress, label: 'Wallet Address' },
      { field: 'twitterUsername', value: twitterUsername, label: 'Twitter Username' },
    ];

    for (const check of checks) {
      if (!check.value) continue;
      const q = query(collection(db, 'users'), where(check.field, '==', check.value));
      const snapshot = await getDocs(q);
      const alreadyExists = snapshot.docs.some(docSnap => docSnap.id !== uid);
      if (alreadyExists) {
        return res.status(409).json({
          error: `${check.label} already in use. Please use another.`,
        });
      }
    }

    await setDoc(doc(db, 'users', uid), {
      username,
      discordUsername,
      twitterUsername,
      profileImage,
      walletAddress,
     // nonce,
    }, { merge: true });

    return res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving profile:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
import { db } from '../../../config';
import { doc, getDocs, setDoc, collection, query, where } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    uid,
    username,
    discordUsername,
    twitterUsername,
    profileImage,
    walletAddress,
    nonce,
  } = req.body;

  if (!uid || !username || !walletAddress || !nonce) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const checks = [
      { field: 'username', value: username, label: 'Username' },
      { field: 'discordUsername', value: discordUsername, label: 'Discord Username' },
      { field: 'walletAddress', value: walletAddress, label: 'Wallet Address' },
      { field: 'twitterUsername', value: twitterUsername, label: 'Twitter Username' },
    ];

    for (const check of checks) {
      if (!check.value) continue;
      const q = query(collection(db, 'users'), where(check.field, '==', check.value));
      const snapshot = await getDocs(q);
      const alreadyExists = snapshot.docs.some(docSnap => docSnap.id !== uid);
      if (alreadyExists) {
        return res.status(409).json({
          error: `${check.label} already in use. Please use another.`,
        });
      }
    }

    await setDoc(doc(db, 'users', uid), {
      username,
      discordUsername,
      twitterUsername,
      profileImage,
      walletAddress,
      nonce,
    }, { merge: true });

    return res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving profile:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
