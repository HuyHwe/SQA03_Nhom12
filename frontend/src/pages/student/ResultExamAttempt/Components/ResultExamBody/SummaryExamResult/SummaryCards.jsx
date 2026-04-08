import { Award, BarChart2, Clock, Trophy } from "lucide-react";

const fmtTime = (s) => {
    if (typeof s !== "number") return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

function SummaryCards( { submissionExam }) {

    const totalTime = submissionExam.attemptedAt && submissionExam.submittedAt
        ? Math.floor((new Date(submissionExam.submittedAt) - new Date(submissionExam.attemptedAt)) / 1000)
        : 0;
    const accuracy = submissionExam.totalCount > 0 ? Math.round((submissionExam.totalCorrect / submissionExam.totalCount) * 100) : 0;
    const pass = accuracy >= 60;
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Điểm
                </div>
                <div className="mt-2 text-2xl font-extrabold text-gray-900">
                {submissionExam.totalCorrect} / {submissionExam.totalCount}
                </div>
                <div className="text-xs text-gray-500 mt-1">Độ chính xác: {accuracy}%</div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Trạng thái
                </div>
                <div className={`mt-2 text-lg font-bold ${pass ? "text-green-700" : "text-red-700"}`}>
                {pass ? "Đạt" : "Chưa đạt"}
                </div>

            </div>

            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Thời gian làm bài
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                    {fmtTime(totalTime)}s
                </div>
                {/* <div className="text-xs text-gray-500 mt-1">
                Giới hạn: {fmtTime(timeLimitSec)}
                </div> */}
            </div>

            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4" /> Huy hiệu
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                {accuracy >= 90 ? "Master" : accuracy >= 75 ? "Pro" : accuracy >= 60 ? "Rising" : "Learner"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Dựa trên % chính xác</div>
            </div>
        </div>
    )
}

export default SummaryCards;