// src/pages/shared/Forum/MyQuestions.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { http } from "../../../utils/http";
import {
    API_BASE,
    BORDER,
    PRIMARY,
    PRIMARY_HOVER,
} from "./utils/constants";
import { isLoggedIn, requireAuth, authHeaders } from "./utils/helpers";
import { QuestionCard } from "./components";

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

export default function MyQuestions() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' hoặc 'deleted'

    // State cho menu và modal
    const [openMenuId, setOpenMenuId] = useState(null); // ID của câu hỏi đang mở menu
    const [deleteConfirmId, setDeleteConfirmId] = useState(null); // ID của câu hỏi đang chờ xác nhận xoá
    const [isDeleting, setIsDeleting] = useState(false);
    const [restoreConfirmId, setRestoreConfirmId] = useState(null); // ID cho khôi phục
    const [isRestoring, setIsRestoring] = useState(false);
    const [hardDeleteConfirmId, setHardDeleteConfirmId] = useState(null); // ID cho xoá vĩnh viễn
    const [isHardDeleting, setIsHardDeleting] = useState(false);


    useEffect(() => {
        if (!isLoggedIn()) {
            requireAuth(navigate, location.pathname + location.search);
            return;
        }
    }, [navigate, location]);

    const fetchMine = async () => {
        // Lấy StudentId từ token
        const token = localStorage.getItem("app_access_token");
        if (!token) throw new Error("Chưa đăng nhập");
        const claims = decodeJwt(token);
        
        const studentId = claims?.StudentId || claims?.studentId;

        if (!studentId) throw new Error("Không tìm thấy StudentId trong token");

        // Gọi API member-specific endpoint
        const res = await http(`${API_BASE}/api/ForumQuestion/member/${studentId}`, {
            headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        // Return data array
        return Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];
    };

    const fetchDeleted = async () => {
        const res = await http(`${API_BASE}/api/ForumQuestion/listForumdeleted`, {
            headers: authHeaders({ accept: "*/*" }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data)
            ? data
            : Array.isArray(data?.data) ? data.data : [];
    };


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const fetchFn = viewMode === 'active' ? fetchMine : fetchDeleted;
                const list = await fetchFn();
                if (!mounted) return;
                setItems(
                    list.sort(
                        (a, b) => new Date(b.deletedAt || b.createdAt || 0) - new Date(a.deletedAt || a.createdAt || 0)
                    )
                );
            } catch (e) {
                if (mounted) setErr(e?.message || "Lỗi tải dữ liệu");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [viewMode]); // Chạy lại khi viewMode thay đổi

    const softDelete = async (id) => {
        if (!id) return;
        setIsDeleting(true);
        try {
            const res = await http(`${API_BASE}/api/ForumQuestion/${id}`, {
                method: "DELETE",
                headers: authHeaders({ accept: "*/*" }),
            });
            if (!res.ok) throw new Error(`Xoá thất bại (HTTP ${res.status})`);
            
            // remove from list
            setItems((prev) => prev.filter((x) => x.id !== id));
            setDeleteConfirmId(null); // Đóng modal
            toast({
                title: "Thành công",
                description: "Đã xoá câu hỏi của bạn.",
            });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const restore = async (id) => {
        if (!id) return;
        setIsRestoring(true);
        try {
            const res = await http(`${API_BASE}/api/ForumQuestion/${id}/restore`, {
                method: "POST",
                headers: authHeaders({ accept: "*/*" }),
            });
            if (!res.ok) throw new Error(`Khôi phục thất bại (HTTP ${res.status})`);
            
            setItems((prev) => prev.filter((x) => x.id !== id));
            setRestoreConfirmId(null);
            toast({
                title: "Thành công",
                description: "Đã khôi phục câu hỏi.",
            });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message, variant: "destructive" });
        } finally {
            setIsRestoring(false);
        }
    };

    const hardDelete = async (id) => {
        if (!id) return;
        setIsHardDeleting(true);
        try {
            const res = await http(`${API_BASE}/api/ForumQuestion/${id}/hard`, {
                method: "DELETE",
                headers: authHeaders({ accept: "*/*" }),
            });
            if (!res.ok) throw new Error(`Xoá vĩnh viễn thất bại (HTTP ${res.status})`);
            
            setItems((prev) => prev.filter((x) => x.id !== id));
            setHardDeleteConfirmId(null);
            toast({
                title: "Thành công",
                description: "Đã xoá vĩnh viễn câu hỏi.",
            });
        } catch (e) {
            toast({ title: "Lỗi", description: e.message, variant: "destructive" });
        } finally {
            setIsHardDeleting(false);
        }
    };

    return (
        <>
            <Header />
            <main className="w-screen overflow-x-hidden">
                <section className="w-screen px-6 lg:px-12 pt-8">                    
                    {viewMode === 'deleted' ? (
                        <div className="mb-4">
                            <Link 
                                to="/forum/my" // Link về trang hiện tại, nhưng onClick sẽ xử lý thay đổi trạng thái
                                onClick={() => setViewMode('active')} 
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                <span>Quay lại câu hỏi của tôi</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <Link to="/forum" className="text-sm text-blue-600 hover:underline flex items-center gap-1 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                <span>Quay lại</span>
                            </Link>
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-3 mt-2">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {viewMode === 'active' ? 'Câu hỏi của tôi' : 'Câu hỏi đã xóa'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {viewMode === 'active' && (
                                <button onClick={() => setViewMode('deleted')} className="text-sm text-slate-600 hover:text-blue-600 hover:underline">
                                    Câu hỏi đã xóa
                                </button>
                            )}
                            <Link
                                to="/forum/new"
                                className="rounded-full text-white px-4 py-2 text-sm font-semibold"
                                style={{ background: PRIMARY }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = PRIMARY_HOVER)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = PRIMARY)
                                }
                            >
                                + Đặt câu hỏi
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="w-screen px-6 lg:px-12 py-8">
                    {err && (
                        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 mb-6">
                            {err}
                        </div>
                    )}
                    {loading ? (
                        <div className="text-slate-500">Đang tải...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {items.map((q) => (
                                <div key={q.id} className="relative group">
                                    <QuestionCard q={q} />
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === q.id ? null : q.id)}
                                            onBlur={() => setTimeout(() => setOpenMenuId(null), 200)}
                                            className="p-2 rounded-full bg-white/50 backdrop-blur-sm border border-transparent opacity-0 group-hover:opacity-100 hover:border-slate-200 transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                        </button>
                                        {openMenuId === q.id && (
                                            <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg z-10">
                                                {viewMode === 'active' ? (
                                                    <ul className="text-sm text-slate-700">
                                                        <li>
                                                            <Link to={`/forum/${q.id}/edit`} className="block w-full text-left px-3 py-1.5 hover:bg-slate-50">Sửa</Link>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                onClick={() => {
                                                                    setDeleteConfirmId(q.id);
                                                                    setOpenMenuId(null);
                                                                }} 
                                                                className="block w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50">
                                                                Xoá
                                                            </button>
                                                        </li>
                                                    </ul>
                                                ) : (
                                                    <ul className="text-sm text-slate-700">
                                                        <li>
                                                            <button onClick={() => { setRestoreConfirmId(q.id); setOpenMenuId(null); }} className="block w-full text-left px-3 py-1.5 hover:bg-slate-50">Khôi phục</button>
                                                        </li>
                                                        <li>
                                                            <button 
                                                                onClick={() => {
                                                                    setHardDeleteConfirmId(q.id);
                                                                    setOpenMenuId(null);
                                                                }} 
                                                                className="block w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50">
                                                                Xoá vĩnh viễn
                                                            </button>
                                                        </li>
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="text-slate-600 col-span-full text-center py-10 border rounded-2xl border-dashed" style={{ borderColor: BORDER }}>
                                    {viewMode === 'active' ? 'Bạn chưa có câu hỏi nào.' : 'Trống.'}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {deleteConfirmId && (
                <ConfirmationDialog
                    isOpen={!!deleteConfirmId}
                    onClose={() => setDeleteConfirmId(null)}
                    onConfirm={() => softDelete(deleteConfirmId)}
                    title="Xác nhận xoá câu hỏi"
                    description="Bạn có chắc muốn xoá (ẩn) câu hỏi này không? Hành động này không thể hoàn tác."
                    confirmText={isDeleting ? "Đang xoá..." : "Xoá"}
                    isConfirming={isDeleting}
                />
            )}

            {restoreConfirmId && (
                <ConfirmationDialog
                    isOpen={!!restoreConfirmId}
                    onClose={() => setRestoreConfirmId(null)}
                    onConfirm={() => restore(restoreConfirmId)}
                    title="Xác nhận khôi phục"
                    description="Bạn có chắc muốn khôi phục câu hỏi này không?"
                    confirmText={isRestoring ? "Đang khôi phục..." : "Khôi phục"}
                    isConfirming={isRestoring}
                    confirmVariant="primary"
                />
            )}

            {hardDeleteConfirmId && (
                <ConfirmationDialog
                    isOpen={!!hardDeleteConfirmId}
                    onClose={() => setHardDeleteConfirmId(null)}
                    onConfirm={() => hardDelete(hardDeleteConfirmId)}
                    title="Xác nhận xoá vĩnh viễn"
                    description="Hành động này sẽ xoá hoàn toàn câu hỏi và không thể hoàn tác. Bạn có chắc chắn không?"
                    confirmText={isHardDeleting ? "Đang xoá..." : "Xoá vĩnh viễn"}
                    isConfirming={isHardDeleting}
                />
            )}

            <Footer />
        </>
    );
}

// Component Modal xác nhận (copied from QuestionDetail)
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming, confirmVariant = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600 mt-2 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50">Huỷ</button>                    
                    <button onClick={onConfirm} disabled={isConfirming} className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 
                        ${confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
