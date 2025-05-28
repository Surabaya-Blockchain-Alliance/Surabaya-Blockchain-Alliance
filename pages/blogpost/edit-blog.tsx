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
  });

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        const postDocRef = doc(db, 'blogposts', postId as string);
        const postSnap = await getDoc(postDocRef);
        if (postSnap.exists()) {
          const postData = postSnap.data();
          const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
          const userSnap = await getDoc(userDocRef);
          const username = userSnap.exists() ? userSnap.data().username : auth.currentUser?.displayName || 'Anonymous';
          if (postData.author.toLowerCase() !== username.toLowerCase()) {
            toast.error('You are not authorized to edit this post.');
            router.push('/dashboard');
            return;
          }
          setTitle(postData.title || '');
          editor?.commands.setContent(postData.content);
        } else {
          toast.error('Post not found.');
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('Error fetching post:', error);
        toast.error(`Failed to load post: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchPost();
    } else {
      toast.error('You must be logged in to edit a post.');
      router.push('/signin');
    }
  }, [postId, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('You must be logged in to edit a post.');
      return;
    }

    if (!title.trim() || !editor?.getJSON().content?.length) {
      toast.error('Title and content are required.');
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
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
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('paragraph') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Paragraph"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Bold"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Code Block"
              >
                <code>{'</>'}</code>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Blockquote"
              >
                "
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                title="Ordered List"
              >
                1.
              </button>
              <select
                onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
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
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`px-2 py-1 rounded ${editor?.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
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