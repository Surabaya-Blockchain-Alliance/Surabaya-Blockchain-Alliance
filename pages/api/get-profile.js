import { db } from '../../config'; 
import { collection, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    const userList = snapshot.docs.map(doc => doc.data());
    
    res.status(200).json(userList);
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
