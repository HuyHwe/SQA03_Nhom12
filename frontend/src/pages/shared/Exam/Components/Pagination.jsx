// src/pages/shared/Exam/Components/Pagination.jsx
import { PRIMARY } from "../utils/examHelpers";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium border"
                style={{
                    borderColor: "#e0e0e0",
                    color: currentPage === 1 ? "#a8b0bc" : "#677788",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
                type="button"
            >
                ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - currentPage) <= 2;
                })
                .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    const isActive = p === currentPage;
                    return (
                        <span key={`p-${p}`} className="inline-flex">
                            {showEllipsis && <span className="px-2 text-[#a8b0bc]">…</span>}
                            <button
                                onClick={() => onPageChange(p)}
                                className="px-3 py-2 rounded-lg text-sm font-medium border"
                                style={
                                    isActive
                                        ? {
                                            backgroundColor: PRIMARY,
                                            color: "#fff",
                                            borderColor: PRIMARY,
                                        }
                                        : { borderColor: "#e0e0e0", color: "#677788" }
                                }
                                type="button"
                            >
                                {p}
                            </button>
                        </span>
                    );
                })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium border"
                style={{
                    borderColor: "#e0e0e0",
                    color: currentPage === totalPages ? "#a8b0bc" : "#677788",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
                type="button"
            >
                ›
            </button>
        </div>
    );
}
