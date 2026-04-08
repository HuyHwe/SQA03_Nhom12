function LessonInformation({ idx, siblings, lesson }) {
    return (
        <div className="bg-white border rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-gray-50 border p-3">
                    <div className="text-xs text-gray-500">Bài hiện tại</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {idx + 1}/{siblings.length}
                    </div>
                </div>
                <div className="rounded-lg bg-gray-50 border p-3">
                    <div className="text-xs text-gray-500">Thời lượng (min)</div>
                    <div className="text-sm font-semibold text-gray-800">
                        {lesson.duration}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LessonInformation;