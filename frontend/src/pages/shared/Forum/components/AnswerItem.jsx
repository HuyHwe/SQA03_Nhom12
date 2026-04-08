// src/pages/shared/Forum/components/AnswerItem.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BORDER, API_BASE } from "../utils/constants";
import { deleteAnswerApi, updateAnswerApi } from "../../../../api/dicussion.api";
import { authHeaders } from "../utils/helpers";
import { useToast } from "../../../../components/ui/Toast";


const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="12" cy="5" r="1"></circle>
        <circle cx="12" cy="19" r="1"></circle>
    </svg>
);

// Giả sử bạn có thông tin người dùng hiện tại, ví dụ: { _id: "some_user_id" }
// Bạn cần truyền currentUser vào component này.
export default function AnswerItem({ a, currentUser, onAnswerUpdated }) {
    const { toast } = useToast();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(a.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // State cho modal báo cáo
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);


    // Giả sử `a.studentId` là ID của người trả lời
    const isMyAnswer = currentUser && currentUser._id === a.studentId;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleUpdateAnswer = async () => {
        if (editedContent.trim() === a.content.trim()) {
            setIsEditing(false);
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await updateAnswerApi(a.id, editedContent);
            if (!res.ok) throw new Error("Cập nhật thất bại");

            // Gọi callback để tải lại danh sách câu trả lời
            await onAnswerUpdated();
            setIsEditing(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnswer = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteAnswerApi(a.id);
            if (!res.ok) throw new Error("Xóa câu trả lời thất bại");

            // Gọi callback để tải lại danh sách câu trả lời
            await onAnswerUpdated();
            setIsDeleteConfirmOpen(false); // Đóng modal khi thành công
        } catch (error) {
            alert(error.message);
            setIsDeleting(false); // Đặt lại trạng thái deleting khi có lỗi
            setIsDeleteConfirmOpen(false); // Đóng modal khi có lỗi
        }
    };

    const submitReport = async (e) => {
        e?.preventDefault();
        if (!reportReason) return;

        setIsReporting(true);
        try {
            const body = {
                targetType: "Discussion",
                targetTypeId: a.id,
                reason: reportReason,
                description: reportDescription
            };
            const res = await fetch(`${API_BASE}/api/Report`, {
                method: "POST",
                headers: authHeaders({
                    "Content-Type": "application/json",
                    accept: "*/*",
                }),
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
        <div
            className="p-5 border-b last:border-b-0 relative"
            style={{ borderColor: BORDER }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Link to={`/u/${a.studentId}`} className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors">
                        {a.studentName || "Người trả lời"}
                    </Link>
                    {a.isAccepted && (
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Accepted
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500">
                        {new Date(a.createdAt || Date.now()).toLocaleString("vi-VN")}
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            <MoreIcon />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border">
                                <ul className="py-1 text-sm text-slate-700">
                                    {isMyAnswer ? (
                                        <>
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-slate-100">Sửa</button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                    disabled={isDeleting}
                                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-slate-100 disabled:opacity-50"
                                                >{isDeleting ? "Đang xóa..." : "Xóa"}</button>
                                            </li>
                                        </>
                                    ) : (
                                        <li>
                                            <button 
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                                            >
                                                Báo cáo
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isEditing ? (
                <div>
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 mb-3"
                        style={{ borderColor: BORDER }}
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                        >
                            Hủy
                        </button>
                        <button onClick={handleUpdateAnswer} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {a.content}
                </div>
            )}

            {isDeleteConfirmOpen && (
                <ConfirmationDialog
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleDeleteAnswer}
                    title="Xác nhận xoá câu trả lời"
                    description="Bạn có chắc chắn muốn xóa câu trả lời này không? Hành động này không thể hoàn tác."
                    confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
                    isConfirming={isDeleting}
                />
            )}

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
        </div>
    );
}

// Component Modal xác nhận (tái sử dụng từ QuestionDetail)
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50">Hủy</button>
                    <button onClick={onConfirm} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400">{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
