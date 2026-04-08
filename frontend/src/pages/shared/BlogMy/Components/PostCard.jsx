// src/pages/shared/BlogMy/Components/PostCard.jsx
import { Link, useNavigate } from "react-router-dom";

export default function PostCard({ post, onSoftDelete, onHardDelete, onRestore }) {
    const navigate = useNavigate();

    return (
        <article className="rounded-2xl border bg-white overflow-hidden">
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                {post.thumbnailUrl ? (
                    <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                        Thumbnail
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleString("vi-VN", { hour12: false })}
                    {" • "}
                    {post.isPublished ? "Đã xuất bản" : "Bản nháp"}
                    {post.isDeleted ? " • ĐÃ XOÁ MỀM" : ""}
                </div>
                <h3 className="mt-2 h-14 font-semibold text-slate-900 line-clamp-2">{post.title}</h3>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Link
                        to={`/blog/${post.id}`}
                        className="rounded-full border px-3 py-1 hover:bg-slate-50"
                    >
                        Xem
                    </Link>

                    {!post.isDeleted && (
                        <button
                            onClick={() => navigate(`/blog/${post.id}/edit`)}
                            className="rounded-full border px-3 py-1 hover:bg-slate-50"
                        >
                            Sửa
                        </button>
                    )}

                    {!post.isDeleted ? (
                        <button
                            onClick={() => onSoftDelete(post.id)}
                            className="rounded-full border px-3 py-1 hover:bg-slate-50 text-rose-600"
                        >
                            Xoá
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onRestore(post.id)}
                                className="rounded-full border px-3 py-1 hover:bg-slate-50 text-green-600"
                            >
                                Khôi phục
                            </button>
                            <button
                                onClick={() => onHardDelete(post.id)}
                                className="rounded-full border px-3 py-1 hover:bg-slate-50 text-rose-700"
                            >
                                Xoá cứng
                            </button>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
