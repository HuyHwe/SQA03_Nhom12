// src/pages/shared/Forum/components/QuestionCard.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BORDER } from "../utils/constants";

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ThumbsUpIcon = ({ isLiked }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
);

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

export default function QuestionCard({ q }) {
    const [likeCount, setLikeCount] = useState(0);
    const [discussionCount, setDiscussionCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [viewCount, setViewCount] = useState(q.views ?? q.viewCount ?? 0);

    const fetchLikes = async () => {
        if (!q.id) return;
        try {
            // Giả sử targetType là 'ForumQuestion'. Bạn hãy thay đổi nếu cần.
            const response = await fetch(`http://localhost:5102/api/Likes/ForumQuestion/${q.id}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Cập nhật tổng số lượt thích
                setLikeCount(data.length);

                // Kiểm tra xem người dùng hiện tại đã thích chưa
                const token = localStorage.getItem("app_access_token");
                const claims = token ? decodeJwt(token) : null;
                const studentId = claims?.StudentId || claims?.studentId;
                if (studentId) {
                    const userLike = data.some(like => like.studentId === studentId);
                    setIsLiked(userLike);
                }
            }
        } catch (error) {
            console.error("Failed to fetch likes:", error);
        }
    };

    useEffect(() => {
        if (!q.id) return;

        const fetchDiscussions = async () => {
            try {
                const response = await fetch(`http://localhost:5102/api/Discussion/ForumQuestion/${q.id}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setDiscussionCount(data.length);
                }
            } catch (error) {
                console.error("Failed to fetch discussions:", error);
            }
        };

        fetchLikes();
        fetchDiscussions();
        // Đồng bộ state viewCount với prop khi nó thay đổi
        setViewCount(q.views ?? q.viewCount ?? 0);
    }, [q.id, q.views, q.viewCount]); // Chạy lại effect khi id hoặc viewCount của câu hỏi thay đổi

    const handleLike = async () => {
        if (!q.id) return;

        const token = localStorage.getItem('app_access_token');
        if (!token) {
            alert("Bạn cần đăng nhập để thực hiện chức năng này.");
            // Có thể điều hướng người dùng đến trang đăng nhập ở đây
            return;
        }

        try {
            const response = await fetch(`http://localhost:5102/api/Likes/ForumQuestion/${q.id}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const result = await response.json();
                // Cập nhật UI ngay lập tức từ response của API
                setLikeCount(result.likeCount);
                setIsLiked(result.liked);
            } else {
                const errorText = await response.text();
                console.error(`Lỗi khi toggle like. Status: ${response.status}`, errorText);
                alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Đã xảy ra lỗi khi thực hiện toggle like:", error);
        }
    };

    const handleCardClick = async () => {
        if (!q.id) return;

        const now = new Date().getTime();
        const VIEW_COOLDOWN_HOURS = 1; // Giới hạn 1 giờ
        const cooldownMs = VIEW_COOLDOWN_HOURS * 60 * 60 * 1000;

        // Lấy lịch sử xem từ localStorage
        const viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '{}');
        const lastViewTime = viewHistory[q.id];

        // Nếu vẫn trong thời gian chờ, không làm gì cả
        if (lastViewTime && (now - lastViewTime < cooldownMs)) {
            console.log(`View count for question ${q.id} is on cooldown.`);
            return; // Dừng lại, không tăng view
        }

        // Cập nhật UI ngay lập tức (Optimistic Update)
        setViewCount(currentCount => currentCount + 1);

        // Gọi API để cập nhật backend
        try {
            await fetch(`http://localhost:5102/api/ForumQuestion/${q.id}/view`, {
                method: 'POST',
            });
            // Nếu thành công, cập nhật lại lịch sử xem trong localStorage
            viewHistory[q.id] = now;
            localStorage.setItem('viewHistory', JSON.stringify(viewHistory));
        } catch (error) {
            console.error("Failed to update view count:", error);
            // Nếu có lỗi, khôi phục lại giá trị ban đầu
            setViewCount(currentCount => currentCount - 1);
        }
    };

    return (
        <article
            className="rounded-2xl border bg-white p-5 hover:shadow-sm transition"
            style={{ borderColor: BORDER }}
        >
            {/* Gắn onClick handler vào Link */}
            <Link to={`/forum/${q.id}`} className="block" onClick={handleCardClick}>
                <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[3rem]">
                    {q.title || "Câu hỏi"}
                </h3>
            </Link>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                #{(q?.tags || "").trim() || ""}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <Link to={`/u/${q.studentId}`} className="truncate max-w-[70%] hover:text-blue-600 hover:underline transition-colors" title={q.authorName}>
                    {q.studentName || "Người hỏi"}
                </Link>
                <span>
                    {new Date(q.createdAt || q.updatedAt || Date.now()).toLocaleString(
                        "vi-VN",
                        { hour12: false }
                    )}
                </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <EyeIcon />
                    {viewCount} {/* Hiển thị viewCount từ state */}
                </span>
                <button onClick={handleLike} className={`flex items-center gap-1 hover:text-slate-800 focus:outline-none ${isLiked ? 'text-blue-600' : ''}`}>
                    <span className="flex items-center gap-1">
                        <ThumbsUpIcon isLiked={isLiked} />
                        {likeCount}
                    </span>
                </button>
                <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {discussionCount}
                </span>
            </div>
        </article>
    );
}
