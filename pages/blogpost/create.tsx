import { useEffect, useState } from 'react';
import { db, auth, storage } from '../../config';
import { collection, getDocs, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreateBlog() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); 
      }
      setCheckingAuth(false); 
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (file) => {
    if (!user) {
      alert('You must be logged in to upload images.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `blog-images/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      const imageMarkdown = `![image](${imageUrl})`;
      setMarkdown((prev) => prev + '\n' + imageMarkdown);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = (editor) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !markdown.trim()) {
      alert('Title and content are required.');
      return;
    }

    setLoading(true);
    try {
      let author = 'Anonymous';
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          author = userData.username || 'Anonymous';
        }
      }
      const postsRef = collection(db, 'blogposts');
      const postsSnap = await getDocs(postsRef);

      let newId = 1;
      if (!postsSnap.empty) {
        const allPosts = postsSnap.docs.map(doc => doc.data());
        newId = Math.max(...allPosts.map(post => post.postNumber)) + 1;
      }
      const blogPostRef = doc(db, 'blogposts', newId.toString());
      await setDoc(blogPostRef, {
        title,
        content: markdown,
        createdAt: serverTimestamp(),
        likes: 0,
        author,
        postNumber: newId, 
      });
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Post creation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-cover bg-fixed" 
         style={{
           backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC')` }}>
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-5xl bg-white shadow-xl rounded-lg opacity-90">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-5xl text-black font-bold mb-6 focus:outline-none placeholder-black bg-white"
            required
          />

          <SimpleMDE
            value={markdown}
            onChange={setMarkdown}
            options={{
              placeholder: 'Write your post in markdown...',
              spellChecker: false,
              minHeight: '400px',
              status: false,
              toolbar: [
                'bold',
                'italic',
                'heading',
                '|',
                'quote',
                'code',
                '|',
                'unordered-list',
                'ordered-list',
                '|',
                'link',
                'image',
                '|',
                'preview',
                'side-by-side',
                'fullscreen',
              ],
              imageUploadFunction: triggerFileUpload,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
