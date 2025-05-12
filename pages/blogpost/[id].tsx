import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";
import { marked } from "marked";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const postRef = doc(db, "blogposts", id);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
          setPost(postSnapshot.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  const renderedContent = marked(post.content || "");

  return (
    <div className="min-h-screen bg-cover bg-fixed" 
    
         style={{
           backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC')` }}>
       <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl bg-white shadow-xl rounded-lg opacity-90">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post Image"
            className="w-full h-60 object-cover rounded-md mt-4"
          />
        )}
        <div
          className="mt-4 text-gray-600"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
        <div className="mt-6">
          <span className="text-sm text-gray-500">Posted by {post.author}</span>
          <span className="text-sm text-gray-500 ml-4">{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
