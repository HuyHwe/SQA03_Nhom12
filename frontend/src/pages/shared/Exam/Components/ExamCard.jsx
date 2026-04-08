// src/pages/shared/Exam/Components/ExamCard.jsx
import { useNavigate } from "react-router-dom";
import { formatDuration, sourceLabel, PRIMARY, PRIMARY_HOVER } from "../utils/examHelpers";

export default function ExamCard({ exam }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex flex-col gap-3 h-full">
                <h3 className="font-semibold text-[#1a1a1a] text-sm line-clamp-2">
                    {exam.title}
                </h3>

                <p className="text-xs text-[#677788] line-clamp-3">
                    {exam.description || "—"}
                </p>

                <div className="space-y-1 text-xs text-[#677788]">
                    <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{formatDuration(exam.durationMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🔓</span>
                        <span>{exam.isOpened ? "Đang mở" : "Đã khóa"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>📁</span>
                        <span>{sourceLabel(exam)}</span>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {exam.lessonId && (
                        <span className="text-xs px-2 py-1 bg-[#e8f2ff] text-[#35509a] rounded">
                            #lesson
                        </span>
                    )}
                    {exam.courseContentId && (
                        <span className="text-xs px-2 py-1 bg-[#e8f2ff] text-[#35509a] rounded">
                            #courseContent
                        </span>
                    )}
                    {typeof exam.totalCompleted === "number" && (
                        <span className="text-xs px-2 py-1 bg-[#f3f4f6] text-[#677788] rounded">
                            Đã làm: {exam.totalCompleted}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    className="w-full py-2 rounded-lg text-sm font-medium mt-auto transition-colors"
                    style={{
                        border: `1px solid ${PRIMARY}`,
                        color: "#fff",
                        backgroundColor: PRIMARY,
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    type="button"
                >
                    Chi tiết
                </button>
            </div>
        </div>
    );
}
