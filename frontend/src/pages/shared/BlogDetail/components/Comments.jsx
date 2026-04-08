// src/pages/shared/BlogDetail/components/Comments.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../../../components/ui/Toast";
import { jwtDecode } from "jwt-decode";
import { ls, fmtTime } from "../utils/helpers";
import { authHeaders } from "../../Blog/utils/helpers";
import { BORDER } from "../utils/constants";

// TODO: Move this to a constants file
const API_BASE = "http://localhost:5102";

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

const Section = ({ id, title, children }) => (
    <section id={id} className="w-screen overflow-x-hidden py-10 lg:py-14">
        <div className="w-screen px-6 lg:px-12">
            {title && (
                <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">{title}</h2>
                </div>
            )}
            {children}
        </div>
    </section>
);

// Component Modal xác nhận, học theo QuestionDetail.jsx
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50">Huỷ</button>
                    <button onClick={onConfirm} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const CommentActions = ({ isOwner, onEdit, onDelete, onReport }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
            </button>
            {isOpen && <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 w-28 text-sm">
                {isOwner ? <> <button onClick={() => { onEdit(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-slate-100">Sửa</button> <button onClick={() => { onDelete(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50">Xoá</button> </> : <button onClick={() => { onReport(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-slate-100">Báo cáo</button>}
            </div>}
        </div>
    );
};

export default function Comments() {
    const { id: postId = "default" } = useParams();
    const KEY = `blog_comments_${postId}`;
    const { toast } = useToast();

    const getUserNameFromToken = () => {
        // Học theo QuestionDetail.jsx: sử dụng key 'app_access_token'
        const token = localStorage.getItem("app_access_token");
        if (!token) return "Khách";
        try {
            // Giả sử claim trong token chứa studentId
            const decoded = jwtDecode(token);
            return decoded.StudentId || decoded.studentId || "Người dùng";
        } catch (error) {
            console.error("Failed to decode token:", error);
            return "Khách";
        }
    };

    const getUserIdFromToken = () => {
        // Học theo QuestionDetail.jsx: sử dụng key 'app_access_token'
        const token = localStorage.getItem("app_access_token");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            // Lấy studentId từ claim, ưu tiên 'StudentId' (viết hoa) như trong QuestionDetail.jsx
            const studentId = decoded.StudentId || decoded.studentId;
            return studentId;
        } catch (error) {
            console.error("Failed to decode token for user ID:", error);
            return null;
        }
    };

    const [items, setItems] = useState([]);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    // State cho modal báo cáo
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState(null);

    // State cho modal xác nhận xoá, học theo QuestionDetail.jsx
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null); // ID của comment đang chờ xoá
    const [isDeleting, setIsDeleting] = useState(false);
    
    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Endpoint để lấy danh sách bình luận cho một bài viết
            const response = await fetch(`${API_BASE}/api/Discussion/Post/${postId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch comments.");
            }
            const data = await response.json();
            // API trả về trực tiếp một mảng các bình luận
            const comments = data || [];
            // Sắp xếp bình luận theo thời gian gần nhất
            setItems(comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (e) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;

        try {
            const requestHeaders = authHeaders();
            // DEBUG: Kiểm tra headers trước khi gửi yêu cầu tạo bình luận
            console.log("[Comments.jsx] addComment - Sending request with headers:", requestHeaders);

            // Endpoint chính xác như user đã xác nhận
            const response = await fetch(`${API_BASE}/api/Discussion/Post/${postId}`, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify({ content: trimmed }),
            });

            if (!response.ok) {
                throw new Error("Failed to post comment.");
            }

            setContent("");
            // Tải lại danh sách bình luận để hiển thị bình luận mới
            await fetchComments();
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    // Hàm mở dialog xác nhận xoá
    const handleDeleteClick = (commentId) => {
        setDeletingCommentId(commentId);
        setIsDeleteConfirmOpen(true);
    };

    const removeComment = async (commentId) => {
        if (!commentId) return;
        setIsDeleting(true);
        try {
            const requestHeaders = authHeaders(false);
            const response = await fetch(`${API_BASE}/api/Discussion/${commentId}`, {
                method: 'DELETE',
                headers: requestHeaders,
            });

            if (!response.ok) {
                throw new Error("Failed to delete comment.");
            }

            // Cập nhật UI
            setItems(items.filter((c) => c.id !== commentId));
            toast({ title: "Thành công", description: "Đã xóa bình luận thành công." });
        } catch (err) {
            setError(err.message);
            console.error(err);
            toast({ title: "Lỗi", description: err.message, variant: "destructive" });
        } finally {
            // Đóng modal và reset state
            setIsDeleteConfirmOpen(false);
            setIsDeleting(false);
            setDeletingCommentId(null);
        }
    };

    const updateComment = async (commentId) => {
        const trimmed = editingContent.trim();
        if (!trimmed) return;

        try {
            const response = await fetch(`${API_BASE}/api/Discussion/${commentId}`, {
                method: 'PUT',
                headers: authHeaders(), // authHeaders đã bao gồm Content-Type
                body: JSON.stringify({ content: trimmed }),
            });
            if (!response.ok) throw new Error("Failed to update comment.");
            
            toast({ title: "Thành công", description: "Đã cập nhật bình luận." });
            // Tải lại danh sách bình luận để đảm bảo dữ liệu nhất quán
            await fetchComments(); 
        } catch (err) {
            setError(err.message);
            toast({ title: "Lỗi", description: err.message, variant: "destructive" });
        } finally {
            setEditingCommentId(null);
            setEditingContent("");
        }
    };

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const submitReport = async (e) => {
        e?.preventDefault();
        if (!reportReason) return;

        setIsReporting(true);
        try {
            const body = {
                targetType: "Discussion",
                targetTypeId: reportingCommentId,
                reason: reportReason,
                description: reportDescription
            };
            const res = await fetch(`${API_BASE}/api/Report`, {
                method: "POST",
                headers: authHeaders(),
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

    const reportComment = (commentId) => {
        setReportingCommentId(commentId);
        setIsReportModalOpen(true);
    };

    return (
        <Section id="comments" title={`Bình luận (${items.length})`}>
            {/* form */}
            <form
                onSubmit={addComment}
                className="rounded-2xl border bg-white p-5 grid gap-3"
                style={{ borderColor: BORDER }}
            >
                {error && (
                    <div className="text-sm text-red-600 bg-red-100 border border-red-400 rounded-lg p-2">
                        Lỗi: {error}
                    </div>
                )}
                <div>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        placeholder={`Viết bình luận`}
                        className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]"
                        style={{ borderColor: BORDER }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Ấn <b>Ctrl + Enter</b> để đăng nhanh
                    </div>
                    <Primary
                        type="submit"
                        onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === "Enter") addComment(e);
                        }}
                    >
                        Đăng bình luận
                    </Primary>
                </div>
            </form>

            {/* list */}
            <div
                className="mt-6 grid gap-4"
            >
                {isLoading && <div className="text-sm text-slate-500">Đang tải bình luận...</div>}
                {!isLoading && items.length === 0 && (
                    <div className="text-sm text-slate-500">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                )}
                {items.map((c) => {
                    const isOwner = getUserIdFromToken() === c.studentId;
                    const isEditing = editingCommentId === c.id;
                    return (
                        <div key={c.id} className="rounded-2xl border bg-white p-4 relative overflow-visible" style={{ borderColor: BORDER }}>
                            {isEditing ? (
                                <form onSubmit={(e) => { e.preventDefault(); updateComment(c.id); }}>
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#93c5fd]"
                                        style={{ borderColor: BORDER }}
                                    />
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button type="button" onClick={() => setEditingCommentId(null)} className="text-sm px-3 py-1 rounded-md hover:bg-slate-100">Huỷ</button>
                                        <button type="submit" className="text-sm bg-[#2563eb] text-white px-3 py-1 rounded-md hover:bg-[#1d4ed8]">Lưu</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">
                                                {c.studentName || "Khách"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {fmtTime(c.createdAt)}
                                            </div>
                                        </div>
                                        <CommentActions
                                            isOwner={isOwner}
                                            onEdit={() => handleEditClick(c)}
                                            onDelete={() => handleDeleteClick(c.id)}
                                            onReport={() => reportComment(c.id)}
                                        />
                                    </div>
                                    <p className="mt-2 text-slate-800 whitespace-pre-wrap">
                                        {c.content}
                                    </p>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal xác nhận xoá */}
            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={() => removeComment(deletingCommentId)}
                title="Xác nhận xoá bình luận"
                description="Bạn có chắc muốn xoá bình luận này không? Hành động này không thể hoàn tác."
                confirmText={isDeleting ? "Đang xoá..." : "Xoá"}
                isConfirming={isDeleting}
            />

            {/* Modal báo cáo */}
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
        </Section>
    );
}
