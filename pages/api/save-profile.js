import { db } from '../../config';
import { doc, setDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { uid, username, twitter, discord, walletAddress, profilePicture } = req.body;
    if (!uid || !username) {
      return res.status(400).json({ error: 'Missing uid or username' });
    }
    await setDoc(doc(db, 'users', uid), {
      username,
      twitter,
      discord,
      walletAddress,
      profilePicture,
    });

    return res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving profile:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
