function CourseLinkExam( { examInfor, updateExamInfor, courseContentInfor } ) {
    return (
        <div className="space-y-3 mb-4">
            <p className="text-sm font-semibold text-gray-600">Exam For:</p>
            <div className="flex flex-wrap gap-3">
                <label
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition
                        ${examInfor.courseContentId === courseContentInfor.id 
                            ? "border-blue-600 bg-blue-50 text-blue-700" 
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                >
                    <input
                        type="radio"
                        name="examFor"
                        checked={examInfor.courseContentId === courseContentInfor.id}
                        onChange={() => {
                            updateExamInfor("courseContentId", courseContentInfor.id);
                            updateExamInfor("lessonId", null);
                        }}
                        className="scale-125"
                    />
                    Course
                </label>

                {courseContentInfor.lessons.map((lesson) => (
                    <label
                        key={lesson.id}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer transition
                            ${examInfor.lessonId === lesson.id
                                ? "border-green-600 bg-green-50 text-green-700"
                                : "border-gray-300 hover:bg-gray-100 text-gray-700"
                            }`}
                    >
                        <input
                            type="radio"
                            name="examFor"
                            checked={examInfor.lessonId === lesson.id}
                            onChange={() => {
                                updateExamInfor("courseContentId", null);
                                updateExamInfor("lessonId", lesson.id);
                            }}
                            className="scale-125"
                        />
                        {lesson.title}
                    </label>
                ))}
            </div>
        </div>
    )
}

export default CourseLinkExam;