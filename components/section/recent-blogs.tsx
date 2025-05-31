import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/config";
import BlogCard from "@/components/blog/blogCard";

interface BlogPost {
    id: string;
    title: string;
    description: string;
    mediaUrl: string;
    createdAt?: any;
}

const RecentBlogs = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const lorem = "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Recusandae, explicabo voluptatum! Doloremque fuga placeat perspiciatis sed sapiente, commodi facilis repellendus non laborum voluptatem? Inventore quas aperiam ab eveniet consequatur veritatis."

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(
                    collection(db, "blogposts"),
                    orderBy("createdAt", "desc"),
                    limit(3)
                );
                const querySnapshot = await getDocs(q);
                const postsData: BlogPost[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as BlogPost[];
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <section className="bg-white min-h-screen mx-auto px-4 space-y-4">
            <div className="space-y-2">
                <h2 className="text-3xl text-black font-bold text-center">
                    Recent Blogs
                </h2>
                <p className="text-black text-center">Read a collection of the latest blogs from <strong>Cardano Hub Indonesia</strong></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 px-40">
                {loading ? (
                    <p className="text-center col-span-full">Loading posts...</p>
                ) : posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => {
                            // First post: Large card (spans 2 rows & 2 columns on medium+ screens)
                            if (index === 0) {
                                return (
                                    <div key={post.id} className="md:col-span-2 md:row-span-2">
                                        <BlogCard
                                            title={post.title}
                                            description={
                                                post.description
                                                    ? post.description.length > 255
                                                        ? post.description.substring(0, 252) + "..."
                                                        : post.description
                                                    : lorem
                                            }

                                            mediaUrl={post.mediaUrl}
                                            id={post.id}
                                            variant="large"
                                        />
                                    </div>
                                );
                            }

                            // Next posts: Regular size
                            return (
                                <div key={post.id}>
                                    <BlogCard
                                        title={post.title}
                                        description={
                                            post.description
                                                ? post.description.length > 255
                                                    ? post.description.substring(0, 252) + "..."
                                                    : post.description
                                                : lorem
                                        }

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

        </section>
    );
};

export default RecentBlogs;
