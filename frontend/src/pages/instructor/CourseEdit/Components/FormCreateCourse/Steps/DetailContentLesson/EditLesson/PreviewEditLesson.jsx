function PreviewEditLesson({lesson}){
    return (
        <div className="flex-1 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Xem trước bài học
            </h2>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-blue-700">
                        {lesson?.title || "Tiêu đề bài học"}
                    </h3>
                    {lesson?.duration && (
                        <span className="text-sm text-gray-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                            {lesson.duration} phút
                        </span>
                    )}
                </div>
                <hr className="my-4" />
                <div className="prose prose-li:marker:text-blue-600 max-w-none prose-img:rounded-lg prose-img:shadow">
                    {lesson?.textContent ? (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: lesson.textContent,
                            }}
                        />
                    ) : (
                        <p className="text-gray-500 italic">
                            Nội dung bài học sẽ hiển thị tại đây...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PreviewEditLesson;