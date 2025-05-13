import Link from "next/link";

const BlogCard = ({ title, description, mediaUrl, id }) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
    >
      <img
        src={mediaUrl ? mediaUrl : "/img/emblem.png"}
        alt={title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="text-2xl text-black font-bold">{title}</h3>
        <p className="mt-2 text-lg text-black">{description}</p>
        <div className="mt-4">
          <Link href={`/blogpost/${id}`}>
            <span className="text-blue-400 hover:underline">Read more</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
