import { Clock3, Layers3, Tag } from "lucide-react";
import ChipsInHeader from "./ChipsInHeader";

function HeaderExam({ exam, formatDuration }){
    return (
        <section className="w-full px-6 lg:px-12 pb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">{exam.title}</h1>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <ChipsInHeader exam={exam} />
                        </div>
                    </div>

                    <div className="flex gap-3 text-sm">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border">
                            <Clock3 className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-800">
                            {formatDuration(exam.durationMinutes)}
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border">
                            <Layers3 className="w-4 h-4 text-gray-600" />
                            {/* Nếu backend có totalQuestions bạn có thể thay exam.totalQuestions thay vì "—" */}
                            <span className="font-medium text-gray-800">{typeof exam?.totalQuestions === "number" ? `${exam.totalQuestions} câu hỏi` : "— câu hỏi"}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border">
                            <Tag className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-800">
                            {exam.lessonId ? "Bài học" : exam.courseContentId ? "Nội dung khóa" : "Khác"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeaderExam;