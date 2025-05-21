import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../config';
import { collection, getDocs, getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import { uploadFile } from '@/utils/upload';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

const markdownToJson = (markdown: string): Array<{ type: string; level?: number; content?: string; src?: string; alt?: string }> => {
  const blocks: Array<{ type: string; level?: number; content?: string; src?: string; alt?: string }> = [];
  const lines = markdown.split('\n').filter((line) => line.trim());

  let currentBlock: { type: string; level?: number; content?: string; src?: string; alt?: string } | null = null;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: 'heading', level: 1, content: line.replace('# ', '').trim() };
    } else if (line.startsWith('## ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: 'heading', level: 2, content: line.replace('## ', '').trim() };
    } else if (line.startsWith('### ')) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: 'heading', level: 3, content: line.replace('### ', '').trim() };
    } else if (line.match(/!\[.*?\]\((.*?)\)/)) {
      if (currentBlock) blocks.push(currentBlock);
      const match = line.match(/!\[.*?\]\((.*?)\)/);
      currentBlock = { type: 'image', src: match![1], alt: '' };
    } else if (line.trim()) {
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.content += ' ' + line.trim();
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'paragraph', content: line.trim() };
      }
    }
  }

  if (currentBlock) blocks.push(currentBlock);
  return blocks;
};

export default function CreateBlog() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push('/signin');
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!user) {
      alert('You must be logged in to upload images.');
      return null;
    }

    setLoading(true);
    try {
      const { gatewayUrl } = await uploadFile(file);
      return gatewayUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Image upload failed: ' + (error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = await handleImageUpload(file);
        if (url && editorRef.current) {
          const imageMarkdown = `![Image](${url})`;
          setMarkdown((prev) => prev + '\n' + imageMarkdown);
          editorRef.current.codemirror.focus();
        }
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          author = userSnap.data().username || 'Anonymous';
        }
      }

      const postsRef = collection(db, 'blogposts');
      const postsSnap = await getDocs(postsRef);
      let newId = 1;
      if (!postsSnap.empty) {
        const allPosts = postsSnap.docs.map((doc) => doc.data());
        newId = Math.max(...allPosts.map((post) => post.postNumber || 0)) + 1;
      }

      const jsonContent = markdownToJson(markdown);
      const blogPostRef = doc(db, 'blogposts', newId.toString());
      await setDoc(blogPostRef, {
        title,
        content: jsonContent,
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 mb-6 focus:outline-none placeholder-gray-400 bg-white"
              required
            />
            <SimpleMDE
              getMdeInstance={(instance) => {
                editorRef.current = instance;
              }}
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
                  {
                    name: 'image',
                    action: triggerFileUpload,
                    className: 'fa fa-image',
                    title: 'Upload Image',
                  },
                  '|',
                  'preview',
                  'side-by-side',
                  'fullscreen',
                ],
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}