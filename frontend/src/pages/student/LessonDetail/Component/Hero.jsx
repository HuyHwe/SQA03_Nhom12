import { Link } from "react-router-dom";

function Hero({lesson}) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <Link to="/s/enrollments" className="text-blue-600 hover:text-blue-700">
                Khóa học của tôi
                </Link>
                <span>›</span>
                <Link to={`/courses/${lesson.courseId}`} className="text-blue-600 hover:text-blue-700">
                {lesson.courseTitle}
                </Link>
                <span>›</span>
                <span className="text-gray-800 font-medium truncate">{lesson.title}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{lesson.title}</h1>

                {/* <div className="flex items-center gap-2">
                <button
                    onClick={toggleBookmark}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    bookmarked ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "hover:bg-gray-50"
                    }`}
                >
                    {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {bookmarked ? "Đã lưu" : "Lưu bài học"}
                </button>

                <button
                    onClick={markComplete}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    completed ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                </button>
                </div> */}
            </div>
        </div>
      </section>
    )
}

export default Hero;