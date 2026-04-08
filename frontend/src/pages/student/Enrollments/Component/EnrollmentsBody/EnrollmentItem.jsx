import fallbackImage from "../../../../../assets/images/fallback-image.jpeg";

function EnrollmentItem({ item }) {
    const progressRaw = item?.progress ?? 0;
    const progressValue = typeof progressRaw === 'number'
        ? (progressRaw <= 1 ? Math.round(progressRaw * 100) : Math.round(progressRaw))
        : 0;

    return (
        <article
            key={item.enrollmentId || item.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
        >
            <div className="flex items-center gap-4 p-4">
                <div className="w-32 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {item.thumbnailUrl ? (
                        <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.src = fallbackImage}
                        />
                    ) : (
                        <span className="grid place-items-center h-full text-gray-400 text-sm">
                            Ảnh
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* <div className="text-xs text-gray-500">
                        {item.categoryName} • {item.lessonCount || 0} bài
                    </div> */}

                    <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
                        {item.title}
                    </h3>

                    <div className="text-sm text-gray-600 mt-1">Giảng viên: {item.teacherName || '—'}</div>

                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div>Tiến độ</div>
                            <div className="font-medium text-gray-700">{progressValue}%</div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                            <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${progressValue}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default EnrollmentItem;