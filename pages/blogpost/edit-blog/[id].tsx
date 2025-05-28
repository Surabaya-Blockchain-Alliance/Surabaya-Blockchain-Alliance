import { useState, useEffect } from 'react';
import { db, auth } from '@/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function EditBlog() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { postId } = router.query;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
        blockquote: {},
        bulletList: {},
        orderedList: {},
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      TextStyle,
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 border rounded bg-white',
      },
    },
    immediatelyRender: false, // Prevent Tiptap SSR hydration mismatch
  });

  useEffect(() => {
    // Skip if postId is not available
    if (!postId) {
      console.log('postId not available:', postId);
      return;
    }

    const fetchPost = async () => {
      try {
        console.log('Starting fetchPost for postId:', postId);

        // Wait for auth state to settle
        if (!auth.currentUser) {
          console.log('No current user, redirecting to signin');
          toast.error('You must be logged in to edit a post.');
          router.push('/signin');
          setLoading(false);
          return;
        }

        console.log('Current user:', auth.currentUser.uid);

        // Set a timeout for Firestore queries
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore query timed out')), 10000)
        );

        // Fetch post and user data concurrently
        const postDocRef = doc(db, 'blogposts', postId as string);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const [postSnap, userSnap] = await Promise.race([
          Promise.all([getDoc(postDocRef), getDoc(userDocRef)]),
          timeoutPromise,
        ]);

        if (!postSnap.exists()) {
          console.log('Post not found:', postId);
          toast.error('Post not found.');
          router.push('/dashboard');
          return;
        }

        const postData = postSnap.data();
        console.log('Post data:', postData);

        const username = userSnap.exists()
          ? userSnap.data().username
          : auth.currentUser.displayName || 'Anonymous';
        console.log('Username:', username);

        // Verify post ownership
        if (postData.author.toLowerCase() !== username.toLowerCase()) {
          console.log('Unauthorized: author mismatch', { postAuthor: postData.author, username });
          toast.error('You are not authorized to edit this post.');
          router.push('/dashboard');
          return;
        }

        // Set post data
        setTitle(postData.title || '');
        if (editor) {
          editor.commands.setContent(postData.content || { type: 'doc', content: [] });
          console.log('Editor content set:', editor.getJSON());
        }
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setError(`Failed to load post: ${error.message}`);
        toast.error(`Failed to load post: ${error.message}`);
      } finally {
        console.log('Fetch complete, setting loading to false');
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? user.uid : 'null');
      if (user) {
        fetchPost();
      } else {
        console.log('No user, redirecting to signin');
        toast.error('You must be logged in to edit a post.');
        router.push('/signin');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [postId, editor, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('You must be logged in to edit a post.');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    if (!editor || !editor.getJSON().content?.length) {
      toast.error('Content is required.');
      return;
    }

    setLoading(true);
    try {
      const postDocRef = doc(db, 'blogposts', postId as string);
      await updateDoc(postDocRef, {
        title,
        content: editor.getJSON(),
      });
      toast.success('Post updated successfully!');
      router.push(`/blogpost/${postId}`);
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error(`Failed to update post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center px-4 py-10">
          <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center px-4 py-10">
          <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-red-500">Failed to initialize editor. Please try again.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 mb-6 focus:outline-none placeholder-gray-400 bg-white"
              required
              disabled={loading}
            />
            <div className="mb-4 flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('paragraph') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Paragraph"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Bold"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Code Block"
              >
                <code>{'</>'}</code>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Blockquote"
              >
                "
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded ${
                  editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Ordered List"
              >
                1.
              </button>
              <select
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="px-2 py-1 rounded bg-white text-black"
                title="Text Color"
              >
                <option value="">Default</option>
                <option value="#000000">Black</option>
                <option value="#ff0000">Red</option>
                <option value="#00ff00">Green</option>
                <option value="#0000ff">Blue</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter the URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`px-2 py-1 rounded ${
                  editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white text-black'
                }`}
                title="Link"
              >
                Link
              </button>
            </div>
            <EditorContent editor={editor} />
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
      <Footer />
    </div>
  );
}