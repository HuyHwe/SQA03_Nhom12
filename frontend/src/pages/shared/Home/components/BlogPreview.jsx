// src/pages/shared/Home/components/BlogPreview.jsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PRIMARY, BORDER } from "../utils/constants";

import fallbackImage from "../../../../assets/images/fallback-image.jpeg";

export default function BlogPreview({ posts = [], loading = false, error = null }) {
    return (
        <section className="w-full px-6 lg:px-12 py-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl lg:text-2xl font-extrabold text-[#1a1a1a]">Bài viết mới</h2>
                <Link to="/blog" className="text-sm font-semibold" style={{ color: PRIMARY }}>
                    Xem tất cả
                </Link>
            </div>

            {error && (
                <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
                    Không thể tải bài viết (chi tiết: {error})
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(loading && posts.length === 0 ? Array.from({ length: 3 }) : posts).map((b, idx) => (
                    <article
                        key={b?.id ?? idx}
                        className="bg-white border rounded-2xl overflow-hidden hover:shadow-sm transition"
                        style={{ borderColor: BORDER }}
                    >
                        <div className="w-full h-36 bg-gray-100">
                            {
                                <img
                                    src={b?.thumbnailUrl || fallbackImage}
                                    // alt={b.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => e.currentTarget.src = fallbackImage}
                                />
                            }
                        </div>
                        <div className="p-4">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-[#eef3ff] text-[#1b3ea9]">
                                {b?.tag ?? "Blog"}
                            </span>
                            <h3 className="mt-2 font-semibold text-[#1a1a1a] line-clamp-2">{b?.title ?? "—"}</h3>
                            <Link
                                to={`/blog/${b?.id}`}
                                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
                                style={{ color: PRIMARY }}
                            >
                                Đọc tiếp <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
