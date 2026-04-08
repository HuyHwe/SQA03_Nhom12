// src/pages/shared/Forum/EditQuestion.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
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

function parseBlocks(contentJson, fallback) {
    try {
        const j =
            typeof contentJson === "string" ? JSON.parse(contentJson) : contentJson;
        const blocks = Array.isArray(j?.blocks) ? j.blocks : [];
        return blocks.map((b) => b.text).join("\n\n").trim() || fallback || "";
    } catch {
        return fallback || "";
    }
}

export default function EditQuestion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (!isLoggedIn()) {
            requireAuth(navigate, location.pathname + location.search);
            return;
        }
    }, [navigate, location]);

    useEffect(() => {
        let ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const res = await http(`${API_BASE}/api/ForumQuestion/${id}`, {
                    headers: { accept: "*/*" },
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const q = data?.data || data;
                setTitle(q?.title || "");
                setContent(parseBlocks(q?.contentJson, q?.content || ""));
            } catch (e) {
                if (e.name === "AbortError") return;
                toast({
                    title: "Lỗi tải dữ liệu",
                    description: e.message || "Không thể tải nội dung câu hỏi.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [id]);

    const canSubmit = !isSubmitting && title.trim().length >= 6 && content.trim().length >= 10;

    const onSubmit = async (e) => {
        e?.preventDefault?.();
        if (!canSubmit) return;
        try {
            setIsSubmitting(true);
            const body = {
                title: title.trim(),
                contentJson: JSON.stringify({ blocks: [{ text: content.trim() }] }),
            };
            const res = await http(`${API_BASE}/api/ForumQuestion/${id}`, {
                method: "PUT",
                headers: authHeaders({
                    "Content-Type": "application/json",
                    accept: "*/*",
                }),
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const j = await res.json();
                    if (j?.message) msg = j.message;
                } catch { }
                throw new Error(msg);
            }
            toast({
                title: "Thành công",
                description: "Câu hỏi của bạn đã được cập nhật.",
            });
            setTimeout(() => navigate(`/forum/my`, { replace: true }), 1000);
        } catch (e) {
            toast({ title: "Cập nhật thất bại", description: e.message, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <main className="w-screen overflow-x-hidden">
                <section className="w-screen px-6 lg:px-12 pt-8">
                    <div className="text-sm text-slate-500">
                        <Link to="/forum" className="hover:text-blue-600">
                            Hỏi – Đáp
                        </Link>{" "}
                        /{" "}
                        <Link to={`/forum/my`} className="hover:text-blue-600">
                            Câu hỏi của tôi
                        </Link>{" "}
                        / <span>Sửa</span>
                    </div>

                    {loading ? (
                        <div
                            className="mt-6 rounded-xl border bg-white p-6 animate-pulse"
                            style={{ borderColor: BORDER }}
                        >
                            Đang tải…
                        </div>
                    ) : (
                        <form
                            onSubmit={onSubmit}
                            className="mt-6 rounded-2xl border bg-white p-5 grid gap-4"
                            style={{ borderColor: BORDER }}
                        >
                            <div>
                                <label className="text-sm font-medium">Tiêu đề</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Nội dung</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={10}
                                    className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                                    style={{ borderColor: BORDER }}
                                />
                            </div>

                            <div className="text-right">
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="rounded-full text-white px-5 py-3 disabled:opacity-60"
                                    style={{ background: PRIMARY }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = PRIMARY_HOVER)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = PRIMARY)
                                    }
                                >
                                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </main>
            <Footer />
        </>
    );
}
