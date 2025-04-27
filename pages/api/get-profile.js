import { db } from '../../config';
import { doc, getDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'Missing UID' });

  try {
    const userDoc = doc(db, 'users', uid);
    const docSnap = await getDoc(userDoc);
    if (!docSnap.exists()) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(docSnap.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
