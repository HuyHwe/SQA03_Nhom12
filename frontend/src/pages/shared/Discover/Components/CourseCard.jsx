// src/pages/shared/Discover/Components/CourseCard.jsx
import TopicIcon from "./TopicIcon";

const tagColor = (color) =>
({
    cyan: "bg-cyan-100 text-cyan-700",
    teal: "bg-teal-100 text-teal-700",
    pink: "bg-pink-100 text-pink-700",
}[color] || "bg-gray-100 text-gray-700");

export default function CourseCard({ course }) {
    return (
        <article className="bg-white border border-gray-200 rounded-2xl hover:shadow-md transition overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <TopicIcon topic={course.topic} />
                        <span className="truncate">{course.category}</span>
                        <span className="mx-1">•</span>
                        <span>{course.duration}</span>
                        <span className="mx-1">•</span>
                        <span>{course.students} học viên</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 truncate">{course.title}</h3>
                </div>
                <span className="shrink-0 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                </span>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
                <p className="text-gray-700 leading-relaxed mb-4">{course.description}</p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {course.features.map((f, i) => (
                        <span key={i} className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${tagColor(f.color)}`}>
                            {f.label}
                        </span>
                    ))}
                </div>

                {/* Details: 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                    {course.details.map((d, i) => (
                        <div key={i}>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">{d.title}</h4>
                            <ul className="text-xs text-gray-700 space-y-1">
                                {d.items.map((it, idx) => (
                                    <li key={idx} className="flex gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span>{it}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
                        Xem chi tiết lộ trình
                    </button>
                    <button className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
                        Sử dụng lịch học này
                    </button>
                </div>
            </div>
        </article>
    );
}
