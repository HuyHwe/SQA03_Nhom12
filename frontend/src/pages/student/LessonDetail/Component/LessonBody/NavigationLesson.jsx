import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NavigationLesson({ prev, next, lesson, navigate }){
    return (
        <div className="flex items-center justify-between gap-3">
            <button
                disabled={!prev}
                onClick={() => prev && navigate(`/s/${lesson.courseContentId}/lesson/${prev.id}`)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm bg-gray-100 ${
                    prev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                }`}
            >
                <ChevronLeft className="w-4 h-4" /> Bài trước
            </button>

            <Link
                to={`/courses/${lesson.courseId}`}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                >
                Về outline
            </Link>

            <button
                disabled={!next}
                onClick={() => next && navigate(`/s/${lesson.courseContentId}/lesson/${next.id}`)}
                className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium ${
                    next ? "hover:bg-blue-700" : "opacity-60 cursor-not-allowed"
                }`}
            >
                Bài tiếp <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}

export default NavigationLesson;