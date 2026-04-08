// src/pages/shared/Forum/QuestionDetail.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { http } from "../../../utils/http";
import {
    API_BASE,
    BORDER,
    PRIMARY,
    PRIMARY_HOVER,
    TARGET_TYPE,
} from "./utils/constants";
import { isLoggedIn, authHeaders } from "./utils/helpers";
import AnswerList from "./components/AnswerList"; // Thay đổi ở đây

function renderContent(contentJson, fallback) {
    try {
        const j =
            typeof contentJson === "string" ? JSON.parse(contentJson) : contentJson;
        const blocks = Array.isArray(j?.blocks) ? j.blocks : [];
        return blocks.map((b) => b.text).join("\n\n") || fallback || "";
    } catch {
        return fallback || "";
    }
}

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

export default function QuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [currentUser, setCurrentUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [q, setQ] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const [answers, setAnswers] = useState([]);
    const [ansLoading, setAnsLoading] = useState(false);

    // Form trả lời
    const [myAnswer, setMyAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // State cho modal xác nhận xoá
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // State cho modal báo cáo
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDescription, setReportDescription] = useState("");
    const [isReporting, setIsReporting] = useState(false);

    // Get current user info from token
    useEffect(() => {
        const token = localStorage.getItem("app_access_token");
        if (token) {
            const claims = decodeJwt(token);
            // Sử dụng _id để nhất quán với các component con
            setCurrentUser({ _id: claims?.StudentId || claims?.studentId });
        }
    }, []);

    // 1. Fetch Question
    useEffect(() => {
        let ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const res = await http(`${API_BASE}/api/ForumQuestion/${id}`, {
                    headers: { accept: "*/*" },
                    signal: ac.signal,
                });
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Không tìm thấy câu hỏi");
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                // The API might return the object directly, or wrapped in a `data` property.
                // The object with `studentName` is what we need.
                // Let's check if the `data` property exists and contains the actual question object.
                const questionData = data?.data && typeof data.data === 'object' ? data.data : data;
                setQ(questionData);
            } catch (e) {
                if (e.name === "AbortError") return;
                setErr(e?.message || "Lỗi tải câu hỏi");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [id]);

    // 2. Fetch Answers
    const fetchAnswers = async (signal) => {
        try {
            setAnsLoading(true);
            const res = await http(
                `${API_BASE}/api/Discussion/${TARGET_TYPE}/${id}`,
                {
                    headers: { accept: "*/*" },
                    signal,
                }
            );
            if (!res.ok) return; // ignore error
            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];
            setAnswers(list);
        } catch (e) {
            if (e.name !== "AbortError") console.error(e);
        } finally {
            setAnsLoading(false);
        }
    };

    useEffect(() => {
        if (!q) return;
        const ac = new AbortController();
        fetchAnswers(ac.signal);
        return () => ac.abort();
    }, [q, id]);

    // 3. Submit Answer
    const submitAnswer = async (e) => {
        e?.preventDefault?.();
        if (!myAnswer.trim()) return;
        if (!isLoggedIn()) {
            navigate(`/login?redirect=/forum/${id}`);
            return;
        }

        try {
            setSubmitting(true);
            const body = { content: myAnswer.trim() };
            const res = await http(`${API_BASE}/api/Discussion/${TARGET_TYPE}/${id}`, {
                method: "POST",
                headers: authHeaders({
                    "Content-Type": "application/json",
                    accept: "*/*",
                }),
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Không thể gửi trả lời");

            setMyAnswer("");
            // reload answers
            await fetchAnswers();
        } catch (e) {
            alert(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    // 5. Submit Report
    const submitReport = async (e) => {
        e?.preventDefault();
        if (!reportReason) return;

        setIsReporting(true);
        try {
            const body = {
                targetType: "ForumQuestion",
                targetTypeId: id,
                reason: reportReason,
                description: reportDescription
            };
            const res = await http(`${API_BASE}/api/Report`, {
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

    // 4. Soft Delete Question
    const softDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await http(`${API_BASE}/api/ForumQuestion/${id}`, {
                method: "DELETE",
                headers: authHeaders({ accept: "*/*" }),
            });
            if (!res.ok) throw new Error(`Xoá thất bại (HTTP ${res.status})`);

            setIsDeleteConfirmOpen(false); // Đóng modal trước khi hiển thị toast
            toast({
                title: "Thành công",
                description: "Đã xoá câu hỏi của bạn. Đang chuyển hướng...",
            });
            setTimeout(() => navigate('/forum/my', { replace: true }), 1500);
        } catch (e) {
            setIsDeleteConfirmOpen(false); // Đóng modal khi có lỗi
            toast({ title: "Lỗi", description: e.message, variant: "destructive" });
        } finally {
            setIsMenuOpen(false);
            setIsDeleting(false);
        }
    };

    // Check if current user is the owner of the question
    // DEBUG: Log IDs to check for ownership
    console.log("Current User ID:", currentUser?._id);
    const isOwner = q?.studentId && currentUser?._id && q.studentId === currentUser._id;

    if (loading) {
        return (
            <>
                <Header />
                <div className="w-screen h-[50vh] grid place-items-center text-slate-500">
                    Đang tải câu hỏi...
                </div>
                <Footer />
            </>
        );
    }

    if (err || !q) {
        return (
            <>
                <Header />
                <div className="w-screen px-6 lg:px-12 py-12 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Đã có lỗi</h2>
                    <p className="text-slate-600">{err || "Không tìm thấy dữ liệu"}</p>
                    <Link
                        to="/forum"
                        className="inline-block mt-4 text-blue-600 hover:underline"
                    >
                        Quay lại diễn đàn
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    const contentText = renderContent(q.contentJson, q.content);

    return (
        <>
            <main className="w-screen overflow-x-hidden bg-slate-50 min-h-screen">
                {/* Breadcrumb */}
                <div className="w-screen px-6 lg:px-12 py-4 bg-white border-b border-slate-200">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Link to="/forum" className="hover:text-blue-600">
                            Hỏi – Đáp
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate max-w-[200px]">
                            {q.title}
                        </span>
                    </div>
                </div>

                <div className="w-screen px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Question Detail */}
                        <article
                            className="relative rounded-2xl border bg-white p-6"
                            style={{ borderColor: BORDER }}
                        >
                            {/* More Options Menu */}
                            {isLoggedIn() && (
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                                        className="p-2 rounded-full hover:bg-slate-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                                            <ul className="text-sm text-slate-700">
                                                {isOwner ? (
                                                    <>
                                                        <li>
                                                            <Link to={`/forum/${id}/edit`} className="block w-full text-left px-4 py-2 hover:bg-slate-50">Sửa</Link>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => {
                                                                    setIsDeleteConfirmOpen(true);
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Xoá</button>
                                                        </li>
                                                    </>
                                                ) : (
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setIsReportModalOpen(true);
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 hover:bg-slate-50"
                                                        >
                                                            Báo cáo
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <h1 className="text-2xl font-bold text-slate-900 mb-4">
                                {q.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
                                <Link to={`/u/${q.studentId}`} className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:underline">
                                    {q.studentName || "Người hỏi"}
                                </Link>
                                <span>
                                    {new Date(
                                        q.createdAt || q.updatedAt || Date.now()
                                    ).toLocaleString("vi-VN")}
                                </span>
                                <span>{q.views ?? 0} lượt xem</span>
                            </div>

                            <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {contentText}
                            </div>

                            {/* Tags */}
                            {q.tags && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {q.tags.split(",").map((t, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded"
                                        >
                                            #{t.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </article>

                        {/* Answers List */}
                        <AnswerList answers={answers} currentUser={currentUser} onAnswerUpdated={fetchAnswers} />

                        {/* Reply Form */}
                        <div
                            className="rounded-2xl border bg-white p-6"
                            style={{ borderColor: BORDER }}
                        >
                            <h3 className="font-bold text-slate-900 mb-4">
                                Câu trả lời của bạn
                            </h3>
                            {!isLoggedIn() ? (
                                <div className="bg-slate-50 p-4 rounded-xl text-center text-sm text-slate-600">
                                    Vui lòng{" "}
                                    <Link
                                        to={`/login?redirect=/forum/${id}`}
                                        className="text-blue-600 font-semibold hover:underline"
                                    >
                                        đăng nhập
                                    </Link>{" "}
                                    để trả lời.
                                </div>
                            ) : (
                                <form onSubmit={submitAnswer}>
                                    <textarea
                                        rows={5}
                                        value={myAnswer}
                                        onChange={(e) => setMyAnswer(e.target.value)}
                                        placeholder="Chia sẻ kiến thức của bạn..."
                                        className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 mb-3"
                                        style={{ borderColor: BORDER }}
                                    />
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            disabled={!myAnswer.trim() || submitting}
                                            className="rounded-full text-white px-6 py-2.5 font-medium disabled:opacity-60"
                                            style={{ background: PRIMARY }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = PRIMARY_HOVER)
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = PRIMARY)
                                            }
                                        >
                                            {submitting ? "Đang gửi..." : "Gửi trả lời"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (Optional) */}
                    <div className="hidden lg:block space-y-6">
                        <div
                            className="rounded-2xl border bg-white p-5"
                            style={{ borderColor: BORDER }}
                        >

                            <ul className="space-y-2">
                                <li>
                                    <Link to="/forum" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        <span>Danh sách câu hỏi</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/forum/my" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        <span>Câu hỏi của tôi</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div
                            className="rounded-2xl border bg-white p-5"
                            style={{ borderColor: BORDER }}
                        >
                            <h3 className="font-bold text-slate-900 mb-3">Mẹo đặt câu hỏi</h3>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                                <li>Mô tả rõ vấn đề bạn gặp phải</li>
                                <li>Đính kèm code hoặc ảnh lỗi nếu có</li>
                                <li>Kiểm tra lại chính tả trước khi đăng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {isDeleteConfirmOpen && (
                <ConfirmationDialog
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={softDelete}
                    title="Xác nhận xoá câu hỏi"
                    description="Bạn có chắc muốn xoá (ẩn) câu hỏi này không? Hành động này không thể hoàn tác."
                    confirmText={isDeleting ? "Đang xoá..." : "Xoá"}
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

            <Footer />
        </>
    );
}

// Component Modal xác nhận
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming }) {
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
}
