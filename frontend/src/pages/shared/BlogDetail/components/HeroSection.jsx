// src/pages/shared/BlogDetail/components/HeroSection.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye } from "../utils/Icons";
import { fmtTime } from "../utils/helpers";
import { useToast } from "../../../../components/ui/Toast";

// Icons, học theo các component khác
const ThumbsUpIcon = ({ isLiked }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
);

const CommentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
);

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
);

// Helper function, học theo QuestionCard.jsx
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

export default function HeroSection({ post }) {
    const { toast } = useToast();
    const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);
    const [commentCount, setCommentCount] = useState(post?.discussionCount ?? 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);

    // Lấy thông tin chi tiết về likes và comments
    useEffect(() => {
        if (!post?.id) return;

        // Lấy thông tin likes
        fetch(`http://localhost:5102/api/Likes/Post/${post.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                if (Array.isArray(data)) {
                    setLikeCount(data.length);
                    const token = localStorage.getItem("app_access_token");
                    const claims = token ? decodeJwt(token) : null;
                    const studentId = claims?.StudentId || claims?.studentId;
                    if (studentId) {
                        setIsLiked(data.some(like => like.studentId === studentId));
                    }
                }
            })
            .catch(err => console.error("Failed to fetch post likes:", err));

        // Lấy thông tin comments
        fetch(`http://localhost:5102/api/Discussion/Post/${post.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                if (Array.isArray(data)) {
                    setCommentCount(data.length);
                }
            })
            .catch(err => console.error("Failed to fetch post comments:", err));

    }, [post?.id]);

    // Kiểm tra xem người dùng hiện tại có phải là tác giả không
    useEffect(() => {
        if (!post?.authorId) return;

        const token = localStorage.getItem("app_access_token");
        if (!token) {
            setIsOwner(false);
            return;
        }

        const claims = decodeJwt(token);
        const currentUserId = claims?.StudentId || claims?.studentId;

        setIsOwner(currentUserId && currentUserId === post.authorId);
    }, [post?.authorId]);

    let isViewApiCalled = false; // Cờ để tránh gọi API nhiều lần

    // Tăng view count
    useEffect(() => {
        if (!post?.id) return;
        console.log(`[View Count] useEffect triggered for post: ${post.id}`);

        const now = new Date().getTime();
        const viewTimestamp = localStorage.getItem(`viewed_post_${post.id}`);
        const oneHour = 60 * 60 * 1000; // 1 giờ tính bằng mili giây

        // Chỉ tăng view nếu chưa từng xem, hoặc lần xem cuối đã hơn 1 giờ trước
        if ((!viewTimestamp || now - parseInt(viewTimestamp, 10) > oneHour) && !isViewApiCalled) {
            // Đặt cờ thành true ngay lập tức để ngăn các lần gọi tiếp theo
            // trong cùng một chu kỳ render (do StrictMode)
            isViewApiCalled = true;

            console.log(`[View Count] Condition met. Calling API for post: ${post.id}`);
            fetch(`http://localhost:5102/api/Posts/${post.id}/view`, {
                method: 'POST',
            })
                .then(res => {
                    if (res.ok) {
                        // Ghi lại thời điểm đã xem vào localStorage
                        localStorage.setItem(`viewed_post_${post.id}`, now.toString());
                        console.log(`[View Count] API call successful. Timestamp saved for post: ${post.id}`);
                    } else if (res.status === 404) {
                        // Nếu bài viết không tồn tại, không cần thử lại
                        console.error(`[View Count] Post with id ${post.id} not found.`);
                    } else {
                        console.error("Failed to increase view count. Status:", res.status);
                    }
                })
                .catch(err => console.error("Error increasing view count:", err));
        } else {
            console.log(`[View Count] Condition NOT met. API call skipped for post: ${post.id}. Last view was less than an hour ago.`);
        }

    }, [post?.id]);

    // Hàm xử lý like/unlike
    const handleLike = async () => {
        if (!post?.id) return;

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

    const submitReport = async (e) => {
        e?.preventDefault();
        if (!reportReason) return;

        const token = localStorage.getItem("app_access_token");
        if (!token) {
            toast({ title: "Lỗi", description: "Bạn cần đăng nhập để báo cáo.", variant: "destructive" });
            return;
        }

        setIsReporting(true);
        try {
            const body = {
                targetType: "Post",
                targetTypeId: post.id,
                reason: reportReason,
                description: reportDescription
            };
            const res = await fetch(`http://localhost:5102/api/Report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Gửi báo cáo thất bại (HTTP ${res.status})`);

            toast({ title: "Thành công", description: "Cảm ơn bạn đã báo cáo vi phạm." });
            setIsReportModalOpen(false);
            setReportReason("");
            setReportDescription("");
        } catch (e) {
            toast({ title: "Lỗi", description: e.message, variant: "destructive" });
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <section className="w-screen overflow-x-hidden pt-8">
            <div className="w-screen px-6 lg:px-12">
                {/* breadcrumb */}
                <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Link to="/blog" className="text-blue-600 hover:underline">
                        Danh sách bài viết
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/blog/my" className="text-blue-600 hover:underline">
                        Bài viết của tôi
                    </Link>
                </div>

                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-screen-xl text-slate-900">
                    {post?.title || "Bài viết"}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden grid place-items-center">
                            <span className="text-xs text-slate-500">IMG</span>
                        </div>
                        <div>
                            {post?.authorId ? (
                                <Link
                                    to={`/u/${post.authorId}`}
                                    className="font-medium leading-tight text-slate-900 hover:underline"
                                >
                                    {post?.authorName || "Tác giả"}
                                </Link>
                            ) : (
                                <div className="font-medium leading-tight text-slate-900">
                                    {post?.authorName || "Tác giả"}
                                </div>
                            )}
                            <div className="text-xs text-slate-500">
                                {post?.createdAt ? fmtTime(post.createdAt) : "—"}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                            <Eye /> {Number(post?.views || 0).toLocaleString("vi-VN")}
                        </span>
                        <button onClick={handleLike} className={`inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none ${isLiked ? 'text-blue-600' : ''}`}>
                            <ThumbsUpIcon isLiked={isLiked} />
                            {likeCount}
                        </button>
                        <span className="inline-flex items-center gap-1.5">
                            <CommentIcon />
                            {commentCount}
                        </span>
                        {isOwner ? (
                            <Link to={`/blog/${post.id}/edit`} title="Chỉnh sửa bài viết" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                                <EditIcon />
                                Sửa
                            </Link>
                        ) : (
                            <button onClick={() => setIsReportModalOpen(true)} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition-colors" title="Báo cáo vi phạm">
                                <ReportIcon />
                                Báo cáo
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Báo cáo vi phạm</h3>
                        <form onSubmit={submitReport}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do <span className="text-red-500">*</span></label>
                                <select 
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Chọn lý do --</option>
                                    <option value="Spam / Quảng cáo">Spam / Quảng cáo</option>
                                    <option value="Nội dung không phù hợp">Nội dung không phù hợp</option>
                                    <option value="Quấy rối / Xúc phạm">Quấy rối / Xúc phạm</option>
                                    <option value="Sai chủ đề">Sai chủ đề</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả thêm</label>
                                <textarea 
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Chi tiết về vi phạm..."
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsReportModalOpen(false)} disabled={isReporting} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50">Huỷ</button>
                                <button type="submit" disabled={!reportReason || isReporting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400">{isReporting ? "Đang gửi..." : "Gửi báo cáo"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
