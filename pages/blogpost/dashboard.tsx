// blogDashboard.tsx
import { useState, useEffect } from 'react';
import { db, auth } from '@/config';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGripLines, FaSearch } from 'react-icons/fa';
import AnimatedBlobs from '@/components/animated/blobs';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import UnderlineButton from '@/components/button/underlined';
import BlogCard from '@/components/blog/blogCard';
import LoadingScreen from '@/components/loading-screen';

const extractDescription = (content, maxLength = 100) => {
  if (!content?.content) return 'No description available.';
  let text = '';
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'text') text += node.text + ' ';
      else if (node.content) traverse(node.content);
    }
  };
  traverse(content.content);
  return text.trim().slice(0, maxLength) + (text.length > maxLength ? '...' : '') || 'No description available.';
};

const extractMediaUrl = (content) => {
  if (!content?.content) return null;
  let url = null;
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'image' && node.attrs?.src) {
        url = node.attrs.src;
        return;
      } else if (node.content) traverse(node.content);
    }
  };
  traverse(content.content);
  return url;
};

export default function BlogDashboard() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All Posts');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      await fetchPosts(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async (firebaseUser) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'blogposts'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = data.sort((a, b) => new Date(b.createdAt?.toDate()).getTime() - new Date(a.createdAt?.toDate()).getTime());

      setPosts(sorted);
      setFilteredPosts(sorted);

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const fetchedUsername = userDoc.exists() ? userDoc.data().username : firebaseUser.displayName || 'Anonymous';
        setUsername(fetchedUsername);

        const userPosts = sorted.filter((post) => post.author?.toLowerCase() === fetchedUsername.toLowerCase());
        setMyPosts(userPosts);

        if (!userPosts.length && fetchedUsername !== 'Anonymous') {
          toast.warn(`No posts found for username "${fetchedUsername}".`);
        }
      } else {
        setUsername(null);
        setMyPosts([]);
        toast.info('Sign in to view your posts.');
      }
    } catch (err) {
      toast.error('Failed to load posts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (query) => {
    if (!query.trim()) {
      setFilteredPosts(posts);
    }
    const lower = query.toLowerCase();
    const result = posts.filter((post) => (post.title || '').toLowerCase().includes(lower));
    setFilteredPosts(result);
    // if (!result.length) toast.info('No posts found.');
  };

  const handleDelete = async (id, author) => {
    if (!user || !username) return toast.error('Please login and reload.');
    if (author.toLowerCase() !== username.toLowerCase()) return toast.error('Cannot delete others\' posts.');
    if (!confirm('Delete this post?')) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'blogposts', id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setFilteredPosts((prev) => prev.filter((p) => p.id !== id));
      setMyPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted.');
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    if (val === 'Your Posts') return setFilteredPosts(myPosts);
    if (val === 'All Posts') return setFilteredPosts(posts);
    if (val === 'Create New Post') return router.push('/blogpost/create');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-white text-black">
      <AnimatedBlobs />
      <div className="px-40 py-8">
        <h1 className="text-5xl font-bold mb-8 text-center">
          IDEAS <span className="text-yellow-400">THAT</span> IN<span className="relative inline-block mx-1">
            <span className="z-10 relative">S</span>
            <span className="absolute -top-2 left-0 w-full h-full bg-yellow-400 -rotate-12 z-0 rounded-sm" /></span>PIRE
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); applySearch(searchQuery); }} className="mb-6 flex gap-3 z-10">
          <div className="flex items-center border border-black rounded-full px-4 py-2 w-full">
            <FaSearch className="text-black mr-2" />
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); applySearch(e.target.value); }}
              className="w-full bg-transparent focus:outline-none placeholder:pt-1" placeholder="Search blogs..." />
          </div>

          <select value={filter} onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-1 rounded-full border border-black text-sm select">
            <option>All Posts</option>
            <option>Your Posts</option>
            <option>Create New Post</option>
          </select>
        </form>

        <div className="flex flex-col justify-center items-center">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  id={post.id}
                  title={post.title || 'No Title'}
                  author={post.author || 'Unknown'}
                  createdAt={
                    post.createdAt
                      ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                      : 'Unknown'
                  }
                  mediaUrl={extractMediaUrl(post.content)}
                  description={extractDescription(post.content)}
                  onDelete={() => handleDelete(post.id, post.author)}
                  onEdit={() => router.push(`/blogpost/edit-blog/${post.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5 text-center">
              {/* Headline */}
              <div className="text-black">
                {user ? (
                  <>
                    <div className="text-2xl font-semibold">Ready to Share Your Story?</div>
                    <div className="text-sm font-medium">Create Your First Blog and Join the Community!</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-semibold">Just Signed Up?</div>
                    <div className="text-sm font-medium">Log In First to Start Blogging!</div>
                  </>
                )}
              </div>

              {/* Lottie Animation */}
              <DotLottieReact
                src="https://lottie.host/d4322b22-d9d8-4353-9f53-9c31aa26dc2a/vqA82FXL98.lottie"
                loop
                autoplay
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />

              {/* No Posts Message */}
              <p className="font-medium text-black text-center text-sm">No posts available.</p>

              {/* Call to Action Button */}
              <div className="text-center">
                {user ? (
                  <UnderlineButton
                    href="/blogpost/create"
                    label="Start Create Post"
                    textColor="text-black"
                    underlineColor="bg-black"
                    iconColor="text-black"
                  />
                ) : (
                  <UnderlineButton
                    href="/signin"
                    label="Signin Now!"
                    textColor="text-black"
                    underlineColor="bg-black"
                    iconColor="text-black"
                  />
                )}
              </div>
            </div>
          )}
        </div>

      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}
