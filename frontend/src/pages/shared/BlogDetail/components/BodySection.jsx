// src/pages/shared/BlogDetail/components/BodySection.jsx
import { useMemo } from "react";
import { BORDER } from "../utils/constants";
import LikeBar from "./LikeBar";
import Comments from "./Comments";

import fallbackImage from "../../../../assets/images/fallback-image.jpeg";
import noImage from "../../../../assets/images/no-image.jpg";

const Primary = ({ children, className = "", ...props }) => (
    <button
        type="button"
        className={
            "rounded-full bg-[#2563eb] text-white px-5 py-3 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
            className
        }
        {...props}
    >
        {children}
    </button>
);

export default function BodySection({ post }) {
    // Parse contentJson → blocks[].text
    const blocks = useMemo(() => {
        if (!post?.contentJson) return [];
        try {
            const parsed =
                typeof post.contentJson === "string"
                    ? JSON.parse(post.contentJson)
                    : post.contentJson;
            const arr = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
            return arr.map((b) => String(b?.text ?? "").trim()).filter(Boolean);
        } catch {
            return [];
        }
    }, [post]);

    return (
        <section className="w-screen overflow-x-hidden">
            <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main article */}
                <article className="lg:col-span-2">
                    {/* Cover image */}
                    <div
                        className="rounded-2xl overflow-hidden border"
                        style={{ borderColor: BORDER }}
                    >
                        {post?.cover ? (
                            <img
                                src={post.cover}
                                alt={post.title}
                                className="w-full aspect-[16/9] object-cover"
                                onError={(e) => e.currentTarget.src = fallbackImage}
                            />
                        ) : (
                            <div className="aspect-[16/9] bg-blue-50 grid place-items-center">
                                <img src={noImage} alt="No cover available" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate max-w-none mt-6">
                        {blocks.length > 0 ? (
                            blocks.map((t, i) => <p key={i}>{t}</p>)
                        ) : (
                            <p className="text-slate-600">
                                Bài viết chưa có nội dung chi tiết hoặc{" "}
                                <code>contentJson</code> trống.
                            </p>
                        )}
                    </div>

                   
                    {/* Comments */}
                    <Comments />
                </article>

                {/* Sidebar */}
                <aside className="lg:col-span-1 lg:sticky lg:top-20 h-fit">
                    <div
                        className="rounded-2xl border bg-white p-6"
                        style={{ borderColor: BORDER }}
                    >
                        <h3 className="font-semibold text-slate-900">Tác giả</h3>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 grid place-items-center">
                                IMG
                            </div>
                            <div>
                                <div className="font-medium leading-tight text-slate-900">
                                    {post?.authorName || "Tác giả"}
                                </div>
                                <div className="text-xs text-slate-500">Theo dõi</div>
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-slate-600">
                            Chia sẻ kiến thức và kinh nghiệm học tập/làm việc mỗi ngày.
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium mb-2 text-slate-900">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {(post?.tags || []).map((t) => (
                                    <span
                                        key={t}
                                        className="text-xs px-3 py-1 rounded-full border"
                                        style={{ borderColor: BORDER }}
                                    >
                                        {t}
                                    </span>
                                ))}
                                {(!post?.tags || post.tags.length === 0) && (
                                    <span
                                        className="text-xs px-3 py-1 rounded-full border"
                                        style={{ borderColor: BORDER }}
                                    >
                                        Blog
                                    </span>
                                )}
                            </div>
                        </div>

                       
                    </div>
                </aside>
            </div>
        </section>
    );
}
