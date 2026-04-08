import { Link } from "react-router-dom";
import { BookOpenText } from "lucide-react";

function QuickAccessLesson({ siblings, lesson, courseContentId }) {
    return (
        <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <BookOpenText className="w-5 h-5 text-gray-700" />
                <h4 className="font-semibold text-gray-900">Outline khóa học</h4>
            </div>
            <ol className="grid gap-2">
                {siblings.map((l) => {
                const active = l.id === lesson.id;
                return (
                    <li key={l.id}>
                        <Link
                            to={`/s/${courseContentId}/lesson/${l.id ?? ''}` }
                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
                            active ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50…"}`
                            }
                        >
                            <div className="min-w-0">
                                <p className={`text-sm truncate ${ active ? "text-blue-800 font-medium" : "text-gray-800" }`}>
                                    {l.order}. {l.title}
                                </p>
                            </div>
                        </Link>
                    </li>
                );
                })}
            </ol>
        </div>
    )
}

export default QuickAccessLesson;