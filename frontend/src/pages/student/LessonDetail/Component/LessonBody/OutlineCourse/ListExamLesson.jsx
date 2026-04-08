import { Link } from "react-router-dom";

function ListExamLesson({ exams }){
    if (!Array.isArray(exams) || exams.length === 0) {
        return (
            <div className="bg-white border rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-3">Các bài kiểm tra</h4>
                <p className="text-gray-600">Không có bài kiểm tra nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-gray-900">Các bài kiểm tra</h4>
            </div>
            <ol className="grid gap-2">
                {exams.map((exam) => {
                return (
                    <li key={exam.id}>
                        <Link
                            to={`/s/exam/${exam.id}`}
                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border}`
                            }
                        >
                            <div className="min-w-0">
                                <p className={`text-sm truncate`}>
                                    {exam.title}
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

export default ListExamLesson;