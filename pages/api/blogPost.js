import { db } from "../../config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { title, content, mediaUrl, author } = req.body;
      
      const docRef = await addDoc(collection(db, "blogposts"), {
        title,
        content,
        mediaUrl: mediaUrl || null,
        author: author || "Anonymous",
        createdAt: serverTimestamp(),
      });
      
      res.status(200).json({ message: "Blog post created successfully", id: docRef.id });
    } catch (error) {
      res.status(500).json({ message: "Error creating blog post", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
