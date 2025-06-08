'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { db, auth } from '@/config';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';
import { FaTelegramPlane } from 'react-icons/fa';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function CreateBlog() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const editor = useRef(null);
  const router = useRouter();

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

  const handleContentChange = useCallback(
    debounce((newContent) => setContent(newContent), 300),
    []
  );

  // Auth Check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setAuthUser(firebaseUser);
      } else {
        router.push('/signin');
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch Profile - runs once after authUser is set
  useEffect(() => {
    if (!authUser) return; // wait until authUser is set

    const fetchProfile = async () => {
      const storedUid = localStorage.getItem('uid');
      if (!storedUid) {
        console.error('UID not found');
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/get-profile?uid=${storedUid}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            username: data.username || 'Not set',
            twitter: data.twitterUsername || null,
            discord: data.discordUsername || null,
            telegram: data.telegram || null,
            walletAddress: data.walletAddress || null,
            pointsCollected: data.points || 0,
            profilePicture: data.profilePicture || null,
          });
        } else {
          console.error('Failed to fetch profile:', response.status);
          // Set dummy profile on failure
          setProfile({
            username: 'Guest User',
            twitter: null,
            discord: null,
            telegram: null,
            walletAddress: null,
            pointsCollected: 0,
            profilePicture: null,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Set dummy profile on error
        setProfile({
          username: 'Guest User',
          twitter: null,
          discord: null,
          telegram: null,
          walletAddress: null,
          pointsCollected: 0,
          profilePicture: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);



  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    setLoading(true);
    try {
      let author = 'Anonymous';
      if (authUser) {
        const userSnap = await getDoc(doc(db, 'users', authUser.uid));
        if (userSnap.exists()) {
          author = userSnap.data().username || 'Anonymous';
        }
      }

      const postsSnap = await getDocs(collection(db, 'blogposts'));
      let newId = 1;
      let slug = generateSlug(title);

      if (!postsSnap.empty) {
        const posts = postsSnap.docs.map((d) => d.data());
        newId = Math.max(...posts.map((p) => p.postNumber || 0)) + 1;

        let slugIndex = 1;
        let tempSlug = slug;
        while (posts.some((p) => p.slug === tempSlug)) {
          tempSlug = `${slug}-${slugIndex++}`;
        }
        slug = tempSlug;
      }

      const newPost = {
        title,
        content,
        createdAt: serverTimestamp(),
        likes: 0,
        author,
        postNumber: newId,
        likedBy: [],
        slug,
      };

      await setDoc(doc(db, 'blogposts', newId.toString()), newPost);
      toast.success('Post created successfully!');
      router.push(`/blogpost/${newId}`);
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('Post creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || !authUser || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-black">
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg">
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
              <p className='text-xl font-semibold'>{profile.username}</p>
              <p className='text-sm font-normal'>
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
                onChange={handleContentChange}
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
                  <span className='pt-1'>Publish</span> <FaTelegramPlane className="ml-2" />
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