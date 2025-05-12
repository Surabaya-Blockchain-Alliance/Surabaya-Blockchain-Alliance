import { useState } from "react";
import { useRouter } from "next/router";

export default function BlogPostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const postData = { title, content, mediaUrl, author };

    try {
      const res = await fetch("/api/create-blogpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Blog post created successfully!");
        router.push(`/blog/${data.id}`); // Navigate to the new blog post page
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to create blog post");
      }
    } catch (error) {
      setError("Error creating blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Create Blog Post</h2>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium" htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            className="w-full p-2 border border-gray-300 rounded"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium" htmlFor="mediaUrl">
            Image URL (Optional)
          </label>
          <input
            type="text"
            id="mediaUrl"
            className="w-full p-2 border border-gray-300 rounded"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium" htmlFor="author">
            Author (Optional)
          </label>
          <input
            type="text"
            id="author"
            className="w-full p-2 border border-gray-300 rounded"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
