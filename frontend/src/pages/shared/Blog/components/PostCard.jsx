// src/pages/shared/Blog/components/PostCard.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BORDER } from "../utils/constants";

import fallbackImage from "../../../../assets/images/fallback-image.jpeg";
import noImage from "../../../../assets/images/no-image.jpg";

const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ThumbsUpIcon = ({ isLiked }) => (
    <svg width="14" height="14" viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
);

const MessageSquareIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

export default function PostCard({ post }) {
    // State để quản lý số liệu, học theo QuestionCard.jsx
    const [likeCount, setLikeCount] = useState(post.likes ?? 0);
    const [commentCount, setCommentCount] = useState(post.comments ?? 0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (!post.id) return;

        // 1. Fetch Likes
        const fetchLikes = async () => {
            try {
                const response = await fetch(`http://localhost:5102/api/Likes/Post/${post.id}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setLikeCount(data.length);
                    const token = localStorage.getItem("app_access_token");
                    const claims = token ? decodeJwt(token) : null;
                    const studentId = claims?.StudentId || claims?.studentId;
                    if (studentId) {
                        setIsLiked(data.some(like => like.studentId === studentId));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch post likes:", error);
            }
        };

        // 2. Fetch Comments
        const fetchComments = async () => {
            try {
                const response = await fetch(`http://localhost:5102/api/Discussion/Post/${post.id}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCommentCount(data.length);
                }
            } catch (error) {
                console.error("Failed to fetch post comments:", error);
            }
        };

        fetchLikes();
        fetchComments();
    }, [post.id]);

    // 3. Handle Like/Unlike
    const handleLike = async (e) => {
        e.preventDefault(); // Ngăn không điều hướng khi click nút like
        if (!post.id) return;

        const token = localStorage.getItem('app_access_token');
        if (!token) {
            alert("Bạn cần đăng nhập để thích bài viết.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5102/api/Likes/Post/${post.id}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const result = await response.json();
                setLikeCount(result.likeCount);
                setIsLiked(result.liked);
            } else {
                alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi thực hiện toggle like:", error);
        }
    };

    return (
        <article
            className="rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
            style={{ borderColor: BORDER }}
        >
            <div className="aspect-[16/9] bg-blue-50">
                {post?.cover ? (
                    <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.src = fallbackImage}
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center">
                        <img src={noImage}/>
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs uppercase tracking-wide text-[#2563eb]">
                        {post.tagDisplay}
                    </span>
                    {post.tags.slice(1, 3).map((t, i) => (
                        <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8]"
                        >
                            #{t}
                        </span>
                    ))}
                </div>
                <h3 className="mt-1 font-semibold text-lg leading-snug text-slate-900 line-clamp-2">
                    {post.title}
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <Link to={`/u/${post.authorId}`} className="truncate max-w-[50%] hover:text-blue-600 hover:underline transition-colors" title={post.authorName}>
                        {post.authorName || "Tác giả"}
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <EyeIcon />
                            {Number(post.views ?? 0).toLocaleString("vi-VN")}
                        </span>
                        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-slate-800 focus:outline-none ${isLiked ? 'text-blue-600' : ''}`}>
                            <ThumbsUpIcon isLiked={isLiked} />
                            {likeCount}
                        </button>
                        <span className="flex items-center gap-1">
                            <MessageSquareIcon />
                            {commentCount}
                        </span>
                    </div>
                </div>

                <div className="mt-4">
                    <Link
                        to={`/blog/${post.id}`}
                        className="inline-block text-sm text-[#2563eb] hover:underline"
                    >
                        Đọc thêm
                    </Link>
                </div>
            </div>
        </article>
    );
}
