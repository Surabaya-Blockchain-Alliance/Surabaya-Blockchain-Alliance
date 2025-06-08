import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTelegramPlane } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/loading-screen';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function EditBlog() {
  const router = useRouter();
  const { postId } = router.query;
  const editor = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>({});

  const config = {
    readonly: false,
    theme: 'light',
    allowDragAndDropFileToEditor: true,
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|', 'outdent', 'indent', '|',
      'font', 'fontsize', 'paragraph', 'classSpan', '|',
      'brush', '|',
      'align', 'undo', 'redo', '|',
      'image', 'link', 'unlink', '|',
      'hr', 'table', 'copyformat', 'fullsize', 'preview'
    ],
    uploader: { insertImageAsBase64URI: true },
  };

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        if (!auth.currentUser) {
          toast.error('You must be logged in to edit a post.');
          router.push('/signin');
          setLoading(false);
          return;
        }

        const postDocRef = doc(db, 'blogposts', postId as string);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);

        const [postSnap, userSnap] = await Promise.all([
          getDoc(postDocRef),
          getDoc(userDocRef),
        ]);

        if (!postSnap.exists()) {
          toast.error('Post not found.');
          router.push('/dashboard');
          return;
        }

        const postData = postSnap.data();
        const userData = userSnap.exists() ? userSnap.data() : {};
        const username = userData.username || auth.currentUser.displayName || 'Anonymous';

        if (postData.author?.toLowerCase() !== username.toLowerCase()) {
          toast.error('You are not authorized to edit this post.');
          router.push('/dashboard');
          return;
        }

        setTitle(postData.title || '');
        setContent(postData.content || '');
        setProfile(userData);
      } catch (err: any) {
        setError(`Failed to load post: ${err.message}`);
        toast.error(`Failed to load post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchPost();
      else {
        toast.error('You must be logged in to edit a post.');
        router.push('/signin');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [postId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const updatedContent = editor.current?.value;

    if (!updatedContent || updatedContent.trim() === '') {
      toast.error('Content is required.');
      return;
    }

    setLoading(true);
    try {
      const postDocRef = doc(db, 'blogposts', postId as string);
      await updateDoc(postDocRef, {
        title,
        content: updatedContent,
      });
      toast.success('Post updated successfully!');
      router.push(`/blogpost/${postId}`);
    } catch (err: any) {
      toast.error(`Failed to update post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
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
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
          <div className="flex justify-start items-center py-2 gap-3">
            <div className="avatar">
              <div className="w-14 rounded-full shadow-lg">
                <img
                  src={profile.profilePicture || '/img/emblem.png'}
                  alt="Profile"
                />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold">{profile.username || 'Anonymous'}</p>
              <p className="text-sm font-normal">
                {new Intl.DateTimeFormat('en-GB', {
                  timeZone: 'Asia/Jakarta',
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).format(new Date())} WIB
              </p>
            </div>
          </div>

          <div className="divider"></div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-gray-900 mb-6 focus:outline-none placeholder-gray-400 bg-white"
              required
            />

            <div className="mb-6 text-black">
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={(newContent) => setContent(newContent)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-black text-white px-6 py-3 w-full rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? (
                <span className="loading loading-infinity loading-lg"></span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="pt-1">Publish</span> <FaTelegramPlane className="ml-2" />
                </span>
              )}
            </button>
          </form>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </div>
  );
}
