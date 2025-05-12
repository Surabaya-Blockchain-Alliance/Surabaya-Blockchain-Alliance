import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config';

export default function CreateComment({ postId }) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return alert('Comment cannot be empty');
    if (!auth.currentUser) return alert('You need to be logged in to comment');

    setLoading(true);

    try {
      await addDoc(collection(db, 'blogposts', postId, 'comments'), {
        authorId: auth.currentUser.uid,
        content: comment,
        createdAt: serverTimestamp(),
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <textarea
        className="w-full p-2 border rounded mb-2"
        placeholder="Add a comment..."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        onClick={handleCommentSubmit}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Posting comment...' : 'Post Comment'}
      </button>
    </div>
  );
}
