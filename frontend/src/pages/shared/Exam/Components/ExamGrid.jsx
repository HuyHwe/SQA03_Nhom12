// src/pages/shared/Exam/Components/ExamGrid.jsx
import ExamCard from "./ExamCard";

export default function ExamGrid({ exams, loading, error, EXAMS_URL }) {
    if (loading) {
        return (
            <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center text-sm text-[#677788] mb-8">
                Đang tải đề thi…
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-red-200 rounded-lg p-8 text-center text-sm text-red-600 mb-8">
                Không thể tải dữ liệu (chi tiết: {error}). Kiểm tra API {EXAMS_URL} hoặc CORS.
            </div>
        );
    }

    if (exams.length === 0) {
        return (
            <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center text-sm text-[#677788] mb-8">
                Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
            ))}
        </div>
    );
}
