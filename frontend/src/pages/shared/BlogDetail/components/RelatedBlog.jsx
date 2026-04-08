// src/pages/shared/BlogDetail/components/RelatedBlog.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../../../utils/http";
import { API_BASE, BORDER } from "../utils/constants";
import { normListItem } from "../utils/helpers";
import { Eye } from "../utils/Icons";

const Section = ({ id, title, action, children }) => (
    <section id={id} className="w-screen overflow-x-hidden py-10 lg:py-14">
        <div className="w-screen px-6 lg:px-12">
            {(title || action) && (
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        {title && (
                            <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">
                                {title}
                            </h2>
                        )}
                    </div>
                    {action}
                </div>
            )}
            {children}
        </div>
    </section>
);

export default function RelatedBlog({ currentId, currentTags }) {
    const ref = useRef(null);
    const scroll = (dir) =>
        ref.current?.scrollBy({
            left: dir === "left" ? -360 : 360,
            behavior: "smooth",
        });

    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);

    const firstTag = currentTags?.[0];

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                let list = [];
                if (firstTag) {
                    // Priority: search by tag
                    const res = await http(
                        `${API_BASE}/api/Posts/search?tag=${encodeURIComponent(firstTag)}`,
                        {
                            headers: { accept: "*/*" },
                        }
                    );
                    if (res.ok) {
                        const json = await res.json();
                        const arr = Array.isArray(json)
                            ? json
                            : Array.isArray(json?.data)
                                ? json.data
                                : [];
                        list = arr.map(normListItem);
                    }
                }
                if (!list.length) {
                    // Fallback: get all posts
                    const res = await http(`${API_BASE}/api/Posts`, {
                        headers: { accept: "*/*" },
                    });
                    if (res.ok) {
                        const json = await res.json();
                        const arr = Array.isArray(json)
                            ? json
                            : Array.isArray(json?.data)
                                ? json.data
                                : [];
                        list = arr.map(normListItem);
                    }
                }
                // Exclude current post, limit to 10
                list = list.filter((p) => p.id !== currentId).slice(0, 10);
                if (mounted) setItems(list);
            } catch (e) {
                if (mounted) setErr(e?.message || "Fetch error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [currentId, firstTag]);

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
                    <Link
                        to="/blog"
                        className="text-[#2563eb] ml-2 hover:underline"
                    >
                        Xem tất cả
                    </Link>
                </div>
            }
        >
            {err && (
                <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
                    Không thể tải bài viết liên quan (chi tiết: {err})
                </div>
            )}

            <div
                ref={ref}
                className="flex gap-6 overflow-x-auto no-scrollbar pr-6"
            >
                {loading && items.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[280px] max-w-[280px] rounded-2xl border bg-white overflow-hidden animate-pulse"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-slate-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                <div className="h-3 w-full bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))
                    : items.map((p) => (
                        <article
                            key={p.id}
                            className="min-w-[280px] max-w-[280px] rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-blue-50">
                                {p.cover ? (
                                    <img
                                        src={p.cover}
                                        alt={p.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center">
                                        <span className="text-xs text-blue-400">
                                            Ảnh blog
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="text-xs uppercase tracking-wide text-[#2563eb]">
                                    {p.tagDisplay}
                                </div>
                                <h3 className="font-semibold leading-snug line-clamp-2 text-slate-900">
                                    {p.title}
                                </h3>
                                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                    <span
                                        className="truncate max-w-[60%]"
                                        title={p.authorName}
                                    >
                                        {p.authorName}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Eye /> {Number(p.views).toLocaleString("vi-VN")}
                                    </span>
                                </div>
                                <Link
                                    to={`/blog/${p.id}`}
                                    className="text-[#2563eb] text-sm mt-2 inline-block hover:underline"
                                >
                                    Đọc thêm
                                </Link>
                            </div>
                        </article>
                    ))}
            </div>
        </Section>
    );
}
