// src/pages/shared/Home/components/ExamShowcase.jsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PRIMARY, PRIMARY_HOVER, BORDER } from "../utils/constants";

export default function ExamShowcase({ exams = [], loading = false, error = null, onNavigate }) {
    return (
        <section className="w-full px-6 lg:px-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg lg:text-xl font-extrabold text-[#1a1a1a]">
                            Thư viện đề thi – Luyện là lên!
                        </h3>
                        <p className="text-sm text-[#677788] mt-1">
                            Đề chuẩn hoá, chấm tự động, xem đáp án chi tiết.
                        </p>
                    </div>
                    <Link
                        to="/exam"
                        className="inline-flex items-center gap-2 rounded-lg text-white px-4 py-2 font-semibold transition"
                        style={{ backgroundColor: PRIMARY }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    >
                        Vào thư viện đề <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {error && (
                    <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 my-4">
                        Không thể tải danh sách đề thi (chi tiết: {error})
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    {(loading && exams.length === 0 ? Array.from({ length: 3 }) : exams).map((ex, idx) => (
                        <div key={ex?.id ?? idx} className="bg-white border rounded-xl p-4" style={{ borderColor: BORDER }}>
                            <p className="font-semibold text-[#1a1a1a] line-clamp-2">{ex?.title || "—"}</p>
                            <div className="mt-2 text-xs text-[#677788]">
                                ⏱️ {ex?.duration ?? "—"} phút • {ex?.opened ? "Đang mở" : "Đã khóa"}
                            </div>
                            <button
                                onClick={() => onNavigate(`/exam/${ex?.id}`)}
                                className="mt-3 w-full rounded-lg text-white py-2 text-sm font-medium transition"
                                style={{ backgroundColor: PRIMARY }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                                type="button"
                                disabled={!ex}
                            >
                                Chi tiết
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
