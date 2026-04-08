// src/pages/shared/BlogAuthor/Components/PostCard.jsx
import { Link } from "react-router-dom";

const BORDER = "#e5e7eb";

export default function PostCard({ post }) {
    return (
        <article
            className="rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
            style={{ borderColor: BORDER }}
        >
            <div className="aspect-[16/9] bg-blue-50">
                {post.cover ? (
                    <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full grid place-items-center">
                        <span className="text-xs text-blue-400">Ảnh blog</span>
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="text-xs uppercase tracking-wide text-[#2563eb]">
                    {post.tagDisplay}
                </div>
                <h3 className="mt-2 font-semibold text-lg leading-snug text-slate-900 line-clamp-2">
                    {post.title}
                </h3>
                <Link
                    to={`/blog/${post.id}`}
                    className="mt-3 inline-block text-[#2563eb] hover:underline"
                >
                    Đọc thêm
                </Link>
            </div>
        </article>
    );
}
