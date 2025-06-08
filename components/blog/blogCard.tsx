import Link from "next/link";
import { FaArrowAltCircleLeft, FaEllipsisH, FaTrashAlt } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import Image from "next/image";

interface BlogCardProps {
  title: string;
  description?: string;
  mediaUrl?: string;
  author?: string;
  createdAt?: string;
  id: string;
  onDelete?: (id: string, author?: string) => void;
  onEdit?: (id: string) => void;
  variant?: "large" | "small";
  user?: string;
  username?: string;
}

const BlogCard = ({
  title,
  description = "",
  mediaUrl = "/img/emblem.png",
  id,
  variant = "small",
  author,
  onEdit,
  onDelete,
  user,
  username,
}: BlogCardProps) => {
  const isAuthor = user && username && author && author.toLowerCase() === username.toLowerCase();

  const handleEdit = () => {
    if (onEdit) onEdit(id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id, author);
  };

  return (
    <div
      className={`${variant === "large" ? "sm:col-span-2 row-span-2" : ""} 
      bg-white shadow-lg text-black border border-[#222] rounded-xl p-6 flex flex-col justify-between`}
    >
      {variant === "large" && (
        <div className="mb-4">
          <Image
            src={mediaUrl}
            alt={title}
            width={600}
            height={256}
            className="w-full h-64 object-cover rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-zinc-700">Blog</p>
          {/* {isAuthor && ( */}
            <div className="dropdown dropdown-hover dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn m-1 bg-transparent text-gray-700 border-none shadow-none hover:bg-transparent"
              >
                <FaEllipsisH />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-sm z-10"
              >
                <li>
                  <button onClick={handleEdit}>
                    <FaPencil />
                    <span className="pt-1">Update Post</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleDelete}>
                    <FaTrashAlt />
                    <span className="pt-1">Delete Post</span>
                  </button>
                </li>
              </ul>
            </div>
          {/* )} */}
        </div>

        <h3 className="text-black text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-gray-700">
          {variant === "large"
            ? description
            : description.length > 120
              ? description.slice(0, 120) + "..."
              : description}
        </p>

        <div className="mt-3">
          <Link href={`/blogpost/${id}`} passHref>
            <span className="text-indigo-400 hover:underline text-sm cursor-pointer">
              Read more →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
