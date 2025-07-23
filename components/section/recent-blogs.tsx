import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/config";
import BlogCard from "@/components/blog/blogCard";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  createdAt?: any;
  content?: any;
}

const extractDescription = (content, maxLength = 255) => {
  if (!content?.content) return "No description available.";
  let text = "";
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === "text") text += node.text + " ";
      else if (node.content) traverse(node.content);
    }
  };
  traverse(content.content);
  return text.trim().slice(0, maxLength) + (text.length > maxLength ? "..." : "") || "No description available.";
};

const extractMediaUrl = (content) => {
  if (!content?.content) return "";
  let url = "";
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === "image" && node.attrs?.src) {
        url = node.attrs.src;
        return;
      } else if (node.content) traverse(node.content);
    }
  };
  traverse(content.content);
  return url;
};

const RecentBlogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "blogposts"), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const postsData: BlogPost[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const mediaUrl = extractMediaUrl(data.content) || "";
          return {
            id: doc.id,
            title: data.title || "Untitled Blog Post",
            description: extractDescription(data.content),
            mediaUrl,
            createdAt: data.createdAt,
            content: data.content,
          };
        });
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section className="bg-white min-h-screen mx-auto px-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl text-black font-bold text-center">Recent Blogs</h2>
        <p className="text-black text-center">
          Read a collection of the latest blogs from <strong>Cardano Hub Indonesia</strong>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 px-40">
        {loading ? (
          <p className="text-center col-span-full">Loading posts...</p>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, index) => {
              if (index === 0) {
                return (
                  <div key={post.id} className="md:col-span-2 md:row-span-2">
                    <BlogCard
                      title={post.title}
                      description={post.description}
                      mediaUrl={post.mediaUrl}
                      id={post.id}
                      variant="large"
                    />
                  </div>
                );
              }

              return (
                <div key={post.id}>
                  <BlogCard
                    title={post.title}
                    description={post.description}
                    mediaUrl={post.mediaUrl}
                    id={post.id}
                    variant="small"
                  />
                </div>
              );
            })}
          </>
        ) : (
          <p className="text-center col-span-full">No blog posts available.</p>
        )}
      </div>
      <ToastContainer position="top-right" />
    </section>
  );
};

export default RecentBlogs;