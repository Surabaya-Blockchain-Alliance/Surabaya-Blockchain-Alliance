import { useState, useEffect } from 'react';
import { db, auth } from '@/config';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import BlogCard from '@/components/blog/blogCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const extractDescription = (content: any, maxLength: number = 100): string => {
  if (!content || !content.content) return 'No description available.';
  
  let text = '';
  const traverseContent = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === 'text' && node.text) {
        text += node.text + ' ';
      } else if (node.content) {
        traverseContent(node.content);
      }
    }
  };
  traverseContent(content.content);
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text.trim() || 'No description available.';
};

const extractMediaUrl = (content: any): string | null => {
  if (!content || !content.content) return null;
  
  let mediaUrl = null;
  const traverseContent = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === 'image' && node.attrs?.src) {
        mediaUrl = node.attrs.src;
        return;
      }
      if (node.content) {
        traverseContent(node.content);
      }
    }
  };
  traverseContent(content.content);
  return mediaUrl;
};

export default function BlogDashboard() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const bgImage: string =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes bg-scrolling-reverse {
        100% { background-position: 50px 50px; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      await fetchPosts(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const fetchPosts = async (firebaseUser: any) => {
    setLoading(true);
    try {
      const postsRef = collection(db, 'blogposts');
      const postsSnap = await getDocs(postsRef);
      const postsData = postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedPosts = postsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        let fetchedUsername = userSnap.exists() ? userSnap.data().username : firebaseUser.displayName || 'Anonymous';
        console.log('Logged-in user UID:', firebaseUser.uid);
        console.log('Fetched username:', fetchedUsername);
        console.log('Firebase displayName:', firebaseUser.displayName);
        console.log('Post details:', postsData.map((post) => ({
          id: post.id,
          title: post.title || 'No Title',
          author: post.author || 'Unknown',
          createdAt: post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'
        })));
        setUsername(fetchedUsername);
        const userPosts = sortedPosts.filter((post) => 
          post.author && fetchedUsername && post.author.toLowerCase() === fetchedUsername.toLowerCase()
        );
        setMyPosts(userPosts);
        if (userPosts.length === 0 && fetchedUsername !== 'Anonymous') {
          toast.warn(`No posts found for username "${fetchedUsername}". Expected author "Alf". Check Firestore user and post data.`);
        }
      } else {
        setMyPosts([]);
        setUsername(null);
        toast.info('Sign in to view your posts.');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      toast.info('Displaying all posts.');
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = posts.filter((post) =>
      (post.title || '').toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredPosts(filtered);

    if (filtered.length === 0) {
      toast.info('No posts found matching your query.');
    }
  };

  const handleDelete = async (postId: string, postAuthor: string) => {
    if (!user) {
      toast.error('You must be logged in to delete posts.');
      return;
    }

    if (!username) {
      toast.error('User data not loaded. Please refresh the page.');
      return;
    }

    console.log('Attempting to delete post:', { postId, postAuthor, username });
    if (postAuthor.toLowerCase() !== username.toLowerCase()) {
      toast.error(`Cannot delete: Post author "${postAuthor}" does not match your username "${username}".`);
      return;
    }

    if (confirm('Are you sure you want to delete this post?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'blogposts', postId));
        setPosts(posts.filter((post) => post.id !== postId));
        setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
        setMyPosts(myPosts.filter((post) => post.id !== postId));
        toast.success('Post deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting post:', error);
        if (error.code === 'permission-denied') {
          toast.error('Permission denied: You are not authorized to delete this post.');
        } else {
          toast.error(`Failed to delete post: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/blogpost/edit-blog/${postId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
        background: `url(${bgImage}) repeat 0 0`,
        animation: 'bg-scrolling-reverse 0.92s linear infinite',
      }}
    >
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-6xl flex gap-6">
          {/* Left Column: All Posts */}
          <div className="w-full lg:w-2/3 bg-white p-6 rounded-lg shadow-2xl">
            <h1 className="text-3xl text-black font-bold mb-6">All Posts</h1>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2 text-black">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setFilteredPosts(posts);
                    }
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 shadow-xl"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
            {user && (
              <button
                onClick={() => router.push('/blogpost/create')}
                className="mb-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 shadow-xl"
              >
                Create New Post
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post.id} className="relative">
                    <BlogCard
                      title={post.title || 'Untitled Post'}
                      description={extractDescription(post.content)}
                      mediaUrl={extractMediaUrl(post.content)}
                      id={post.id}
                    />
                    {user && username && post.author && post.author.toLowerCase() === username.toLowerCase() && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.author)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-xl"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No posts available.</p>
              )}
            </div>
          </div>

          {/* Right Column: My Posts */}
          <div className="hidden lg:block w-1/3 bg-white p-6 rounded-lg shadow-2xl">
            <h2 className="text-2xl text-black font-bold mb-6">My Posts</h2>
            {user ? (
              myPosts.length > 0 ? (
                <div className="space-y-6">
                  {myPosts.map((post) => (
                    <div key={post.id} className="relative">
                      <BlogCard
                        title={post.title || 'Untitled Post'}
                        description={extractDescription(post.content)}
                        mediaUrl={extractMediaUrl(post.content)}
                        id={post.id}
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.author)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-xl"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven't created any posts yet. <a href="/blogpost/create" className="text-blue-500 hover:underline">Create one now!</a></p>
              )
            ) : (
              <p className="text-gray-500">Sign in to view your posts. <a href="/signin" className="text-blue-500 hover:underline">Sign in now!</a></p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}