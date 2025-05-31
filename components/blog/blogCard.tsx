import Link from "next/link";

interface BlogCardProps {
  title: string;
  description?: string;
  mediaUrl?: string;
  id: string;
  variant?: "large" | "small";
}

const BlogCard = ({
  title,
  description = "",
  mediaUrl = "/img/emblem.png",
  id,
  variant = "small",
}: BlogCardProps) => {
  return (
    <div
      className={`${
        variant === "large"
          ? "sm:col-span-2 row-span-2"
          : "bg-white shadow-lg text-black border border-[#222]"
      } rounded-xl p-6 bg-white shadow-lg text-black flex flex-col border border-[#222] justify-between`}
    >
      {variant === "large" && (
        <div className="mb-4">
          <img
            src={mediaUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-700">Blog</p>
        <h3 className="text-black text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-black-300">
          {variant === "large"
            ? description
            : description.length > 120
            ? description.slice(0, 120) + "..."
            : description}
        </p>
        <div className="mt-3">
          <Link href={`/blogpost/${id}`}>
            <span className="text-indigo-400 hover:underline text-sm">
              Read more →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
