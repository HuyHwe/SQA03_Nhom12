// src/pages/shared/Blog/components/MyBlogPreview.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../../../utils/http";
import {
    API_BASE,
    BORDER,
    PRIMARY,
    PRIMARY_HOVER,
} from "../utils/constants";
import {
    getAuthInfoStrict,
    authHeaders,
    isLoggedIn,
} from "../utils/helpers";
import { Section } from "./Common";

export default function MyBlogPreview({ refreshKey }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const loggedIn = isLoggedIn();

    const { memberId } = getAuthInfoStrict();

    useEffect(() => {
        if (!loggedIn || !memberId) return;
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const res = await http(`${API_BASE}/api/Posts/member/${memberId}`, {
                    headers: authHeaders({ accept: "*/*" }),
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list = (Array.isArray(data) ? data : []).map((p) => ({
                    id: p?.id,
                    title: p?.title || "Bài viết",
                    cover: p?.thumbnailUrl || "/images/blog-placeholder.jpg",
                    tags: (p?.tags || "")
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    tagDisplay:
                        (p?.tags || "")
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)[0] || "Blog",
                    views: p?.viewCount ?? 0,
                    likes: p?.likeCount ?? 0,
                    comments: p?.discussionCount ?? 0,
                    isPublished: !!p?.isPublished,
                    createdAt: p?.createdAt || null,
                    authorId: p?.authorId || null,
                    authorName: p?.authorName || "Tác giả",
                }));
                list.sort(
                    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                );
                setItems(list.slice(0, 3));
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [loggedIn, memberId, refreshKey]);

    return (
        <Section
            id="myblog"
            title="Bài viết của tôi"
            subtitle={
                loggedIn
                    ? "3 bài gần đây nhất của bạn"
                    : "Đăng nhập để quản lý & viết bài"
            }
            action={
                loggedIn ? (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/blog/new"
                            className="rounded-full text-white px-4 py-2 text-sm font-semibold transition"
                            style={{ backgroundColor: PRIMARY }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = PRIMARY)
                            }
                        >
                            + Viết bài
                        </Link>
                        <Link to="/blog/my" className="text-[#2563eb] hover:underline">
                            Bài viết của tôi
                        </Link>
                    </div>
                ) : (
                    <Link to="/login" className="text-[#2563eb] hover:underline">
                        Đăng nhập
                    </Link>
                )
            }
        >
            {!loggedIn ? (
                <div
                    className="rounded-2xl border bg-white p-6 text-slate-600"
                    style={{ borderColor: BORDER }}
                >
                    Bạn chưa đăng nhập. Hãy đăng nhập để xem và quản lý bài viết của mình.
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border bg-white overflow-hidden animate-pulse"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-slate-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-3 w-16 bg-slate-100 rounded" />
                                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                <div className="h-3 w-full bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((p) => (
                        <article
                            key={p.id}
                            className="rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-blue-50">
                                {p.cover ? (
                                    <img
                                        src={p.cover}
                                        alt={p.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="p-5">
                                <div className="text-xs uppercase tracking-wide text-[#2563eb]">
                                    {p.tagDisplay}
                                </div>
                                <h3 className="mt-1 font-semibold text-lg leading-snug text-slate-900 line-clamp-2">
                                    {p.title}
                                </h3>
                                <div className="mt-3 text-sm text-slate-600">
                                    {p.authorName}
                                </div>
                                <Link
                                    to={`/blog/${p.id}`}
                                    className="mt-3 inline-block text-[#2563eb] hover:underline"
                                >
                                    Đọc thêm
                                </Link>
                            </div>
                        </article>
                    ))}
                    {items.length === 0 && (
                        <div
                            className="rounded-2xl border bg-white p-6 text-slate-600 col-span-full"
                            style={{ borderColor: BORDER }}
                        >
                            Chưa có bài viết nào.
                        </div>
                    )}
                </div>
            )}
        </Section>
    );
}
