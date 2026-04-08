// src/pages/shared/Blog/components/RelatedBlogs.jsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Section } from "./Common";
import { BORDER } from "../utils/constants";
import PostCard from "./PostCard";

export default function RelatedBlogs({ posts, loading, error }) {
    const ref = useRef(null);
    const scroll = (dir) =>
        ref.current?.scrollBy({
            left: dir === "left" ? -360 : 360,
            behavior: "smooth",
        });

    return (
        <Section
            id="related"
            title="Bài viết liên quan"
            action={
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className="rounded-full border px-3 py-2 hover:bg-slate-50"
                        aria-label="Trượt trái"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="rounded-full border px-3 py-2 hover:bg-slate-50"
                        aria-label="Trượt phải"
                    >
                        ›
                    </button>
                    <Link to="/blog" className="text-[#2563eb] ml-2 hover:underline">
                        Xem tất cả
                    </Link>
                </div>
            }
        >
            {error && (
                <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
                    Không thể tải bài viết liên quan (chi tiết: {error})
                </div>
            )}

            {loading && posts.length === 0 ? (
                <div ref={ref} className="flex gap-6 overflow-x-auto no-scrollbar pr-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[280px] max-w-[280px] rounded-2xl border bg-white overflow-hidden animate-pulse"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-slate-100" />
                            <div className="p-5">
                                <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
                                <div className="h-4 w-3/4 bg-slate-100 rounded mb-1" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div ref={ref} className="flex gap-6 overflow-x-auto no-scrollbar pr-6 min-h-[320px]">
                    {posts.map((p) => (
                        <div key={p.id} className="min-w-[280px] max-w-[280px]">
                            <PostCard post={p} />
                        </div>
                    ))}
                    {posts.length === 0 && !loading && (
                        <div className="w-full flex items-center justify-center text-center text-slate-600 border border-dashed rounded-2xl" style={{ borderColor: BORDER }}>
                            Không có bài viết liên quan.
                        </div>
                    )}
                </div>
            )}
        </Section>
    );
}
