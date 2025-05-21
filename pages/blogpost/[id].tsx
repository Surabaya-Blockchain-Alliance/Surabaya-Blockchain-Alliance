import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../config';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, serverTimestamp, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

const renderJsonContent = (content) => {
  if (!Array.isArray(content)) return null;

  return content.map((block, index) => {
    switch (block.type) {
      case 'heading':
        const Tag = `h${block.level}`;
        return (
          <Tag
            key={index}
            className={`font-bold ${
              block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : 'text-xl'
            } mt-4 mb-2 text-gray-900`}
          >
            {block.content}
          </Tag>
        );
      case 'paragraph':
        return (
          <p key={index} className="text-gray-600 mt-2 mb-4">
            {block.content}
          </p>
        );
      case 'image':
        return (
          <div key={index} className="relative w-full h-80 mt-4 mb-4">
            <img
              src={block.src}
              alt={block.alt || 'Post Image'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="rounded-md"
            />
          </div>
        );
      default:
        return null;
    }
  });
};

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!id) return;

      try {
        const postRef = doc(db, 'blogposts', id);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
          setPost(postSnapshot.data());
        } else {
          console.error('No such document!');
        }

        const commentsRef = collection(db, 'blogposts', id, 'comments');
        const commentsSnapshot = await getDocs(commentsRef);
        const commentsData = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || 0,
          likedBy: doc.data().likedBy || [],
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load post or comments.');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        setUser({
          uid: firebaseUser.uid,
          username: userSnap.exists() ? userSnap.data().username || 'Anonymous' : 'Anonymous',
        });
      } else {
        setUser(null);
      }
    });

    fetchPostAndComments();

    return () => unsubscribe();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      setError('You must be logged in to like this post.');
      router.push('/signin');
      return;
    }

    try {
      const postRef = doc(db, 'blogposts', id);
      const hasLiked = post?.likedBy?.includes(user.uid);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes: (post?.likes || 0) - 1,
          likedBy: arrayRemove(user.uid),
        });
        setPost((prev) => ({
          ...prev,
          likes: (prev?.likes || 0) - 1,
          likedBy: prev.likedBy.filter((uid) => uid !== user.uid),
        }));
      } else {
        await updateDoc(postRef, {
          likes: (post?.likes || 0) + 1,
          likedBy: arrayUnion(user.uid),
        });
        setPost((prev) => ({
          ...prev,
          likes: (prev?.likes || 0) + 1,
          likedBy: [...(prev.likedBy || []), user.uid],
        }));
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      setError('Failed to update like status.');
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      setError('You must be logged in to like this comment.');
      router.push('/signin');
      return;
    }

    try {
      const commentRef = doc(db, 'blogposts', id, 'comments', commentId);
      const comment = comments.find((c) => c.id === commentId);
      const hasLiked = comment?.likedBy?.includes(user.uid);

      if (hasLiked) {
        await updateDoc(commentRef, {
          likes: (comment?.likes || 0) - 1,
          likedBy: arrayRemove(user.uid),
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: (c.likes || 0) - 1,
                  likedBy: c.likedBy.filter((uid) => uid !== user.uid),
                }
              : c
          )
        );
      } else {
        await updateDoc(commentRef, {
          likes: (comment?.likes || 0) + 1,
          likedBy: arrayUnion(user.uid),
        });
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: (c.likes || 0) + 1,
                  likedBy: [...(c.likedBy || []), user.uid],
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating comment likes:', error);
      setError('Failed to update comment like status.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to comment.');
      router.push('/signin');
      return;
    }

    if (!comment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const commentsRef = collection(db, 'blogposts', id, 'comments');

      if (editingCommentId) {
        const commentRef = doc(db, 'blogposts', id, 'comments', editingCommentId);
        const updatedComment = {
          content: comment.trim(),
          author: user.username,
          createdAt: comments.find((c) => c.id === editingCommentId).createdAt,
          updatedAt: serverTimestamp(),
          likes: comments.find((c) => c.id === editingCommentId).likes || 0,
          likedBy: comments.find((c) => c.id === editingCommentId).likedBy || [],
        };
        await updateDoc(commentRef, updatedComment);
        setComments((prev) =>
          prev.map((c) =>
            c.id === editingCommentId
              ? { ...c, ...updatedComment, updatedAt: { seconds: Date.now() / 1000 } }
              : c
          )
        );
        setEditingCommentId(null);
      } else {
        const newComment = {
          content: comment.trim(),
          author: user.username,
          createdAt: serverTimestamp(),
          likes: 0,
          likedBy: [],
        };
        const commentDocRef = await addDoc(commentsRef, newComment);
        setComments((prev) => [
          ...prev,
          { id: commentDocRef.id, ...newComment, createdAt: { seconds: Date.now() / 1000 } },
        ]);
      }
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setComment(content);
    setError('');
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      setError('You must be logged in to delete a comment.');
      return;
    }

    try {
      const commentRef = doc(db, 'blogposts', id, 'comments', commentId);
      await deleteDoc(commentRef);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Post not found.</div>;
  }

  const hasLiked = user && post?.likedBy?.includes(user.uid);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md prose prose-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div className="text-gray-600">{renderJsonContent(post.content)}</div>
          <div className="border-t pt-4 mt-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Posted by {post.author}</span>
              <span className="text-sm text-gray-500 ml-4">
                {post.createdAt?.seconds
                  ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                      dateStyle: 'medium',
                    })
                  : 'Unknown date'}
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLike}
                className={`flex items-center text-sm ${
                  hasLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                }`}
                disabled={!user}
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill={hasLiked ? 'currentColor' : 'none'}
                  stroke={hasLiked ? 'none' : 'currentColor'}
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {post.likes || 0} {post.likes === 1 ? 'Like' : 'Likes'}
              </button>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {comments.length === 0 ? (
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            ) : (
              comments
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .map((comment) => (
                  <div key={comment.id} className="border-b py-4">
                    <p className="text-gray-600">{comment.content}</p>
                    <div className="text-sm text-gray-500 mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span>By {comment.author}</span>
                          <span className="ml-4">
                            {comment.createdAt?.seconds
                              ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                                  dateStyle: 'medium',
                                })
                              : 'Unknown date'}
                            {comment.updatedAt?.seconds && (
                              <span className="ml-2">(Edited)</span>
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center text-sm ${
                            user && comment.likedBy?.includes(user.uid)
                              ? 'text-red-600'
                              : 'text-gray-600 hover:text-red-600'
                          }`}
                          disabled={!user}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill={user && comment.likedBy?.includes(user.uid) ? 'currentColor' : 'none'}
                            stroke={user && comment.likedBy?.includes(user.uid) ? 'none' : 'currentColor'}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {comment.likes || 0} {comment.likes === 1 ? 'Like' : 'Likes'}
                        </button>
                      </div>
                      {user && comment.author === user.username && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id, comment.content)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={user ? 'Write your comment...' : 'Please sign in to comment'}
                className="w-full p-3 border rounded-lg bg-transparent text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                disabled={!user}
              />
              <button
                type="submit"
                disabled={submitting || !user}
                className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : editingCommentId ? 'Update Comment' : 'Post Comment'}
              </button>
              {editingCommentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(null);
                    setComment('');
                    setError('');
                  }}
                  className="mt-2 ml-4 text-sm text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}