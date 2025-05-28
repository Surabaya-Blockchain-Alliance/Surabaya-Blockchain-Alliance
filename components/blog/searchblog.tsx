import { useState, useEffect } from 'react';
import { db } from '@/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SearchBlog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term.');
      return;
    }

    setLoading(true);
    try {
      const postsRef = collection(db, 'blogposts');
      const titleQuery = query(postsRef, where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));
      const titleSnapshot = await getDocs(titleQuery);
      
      const results: any[] = [];
      titleSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      setSearchResults(results);
      if (results.length === 0) {
        toast.info('No posts found matching your query.');
      }
    } catch (error) {
      console.error('Error searching posts:', error);
      toast.error('Search failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Search Blog Posts</h1>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
          <div className="space-y-4">
            {searchResults.length > 0 ? (
              searchResults.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/blogpost/${post.id}`)}
                >
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-gray-600">By {post.author} on {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                  <p className="text-gray-500">Likes: {post.likes || 0}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No results to display.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}