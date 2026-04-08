import { useMemo } from "react";
import { BookOpen, Layers, DollarSign, Info } from "lucide-react";
import EditListLesson from "./EditListLesson.jsx";

function DetailContentLesson( { 
    course,
    updateCourse,
    courseContent,
    updateCourseContent,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson
} ) {
    const nf = new Intl.NumberFormat("vi-VN");
    const money = (v) => nf.format(v) + "đ";

    const lessons = courseContent.lessons;

    const totalDuration = useMemo(() => {
        return lessons.reduce((sum, lesson) => sum + (Number(lesson.duration) || 0), 0);
    }, [lessons]);

    const formatDuration = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} giờ ${minutes} phút`;
    }

    const finalPrice = useMemo(() => {
        const pct = Math.min(100, Math.max(0, Number(course.discount) || 0));
        const base = Math.max(0, Number(course.price) || 0);
        return Math.max(0, base - Math.floor((base * pct) / 100));
    }, [course.price, course.discount]);

    return (
        <div className="rounded-2xl border bg-white p-6 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">
                    2) Nội dung & Giá
                </h2>
                <p className="text-sm text-gray-600">
                    Thêm phần giới thiệu khóa học, danh sách bài học và thiết lập giá bán.
                </p>
            </div>

            <div className="rounded-xl border p-4 bg-blue-50/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Giới thiệu khóa học *
                </div>
                <div className="grid gap-3">
                    <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-800">
                            Tiêu đề phần giới thiệu *
                        </span>
                        <input
                            value={courseContent.title}
                            onChange={(e) => updateCourseContent("title", e.target.value)}
                            placeholder="VD: Chào mừng đến với khóa học React"
                            className={`rounded-xl border px-4 py-2 outline-none focus:ring-2 ${!courseContent.title
                                ? "border-rose-300 focus:ring-rose-200 bg-white"
                                : "border-gray-300 focus:ring-blue-200 bg-white"
                                }`}
                        />
                        {!courseContent.title && (
                            <span className="text-xs text-rose-600">
                                Vui lòng nhập tiêu đề phần giới thiệu
                            </span>
                        )}
                    </label>
                    <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-800">
                            Mô tả chi tiết
                        </span>
                        <textarea
                            value={courseContent.introduce}
                            onChange={(e) => updateCourseContent("introduce", e.target.value)}
                            rows={4}
                            placeholder="Giới thiệu tổng quan về nội dung, mục tiêu và cấu trúc khóa học..."
                            className="rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                        />
                    </label>
                    <div className="text-xs text-gray-600 bg-white rounded-lg p-2 border">
                        <Info className="w-3.5 h-3.5 inline mr-1" />
                        Thời lượng: {formatDuration(totalDuration)}
                    </div>
                </div>
            </div>

            {/* Edit List of Lessons */}
            <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Layers className="w-4 h-4 text-indigo-600" /> Danh sách bài học *
                    </div>
                </div>

                <EditListLesson 
                    lessons={lessons}
                    addLesson={addLesson}
                    removeLesson={removeLesson}
                    updateLesson={updateLesson}
                    moveLesson={moveLesson}
                />

                {!courseContent.lessons.length && (
                    <p className="text-xs mt-2 text-rose-600">
                        Vui lòng thêm ít nhất một bài học
                    </p>
                )}
            </div>

            {/* Pricing */}
            <div className="rounded-xl border p-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
                <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-800 inline-flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Giá bán (VND)
                    </span>
                    <input
                        type="number"
                        min="0"
                        value={course.price}
                        onChange={(e) => updateCourse("price", e.target.value) }
                        className="rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </label>
                <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-800">
                        Giảm giá (%)
                    </span>
                    <input
                        type="number"
                        value={course.discount}
                        min="0"
                        max="100"
                        onChange={(e) => updateCourse("discount", e.target.value)}
                        className="rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </label>
                <div className="grid gap-1">
                    <span className="text-sm font-medium text-gray-800">
                        Giá sau giảm
                    </span>
                    <div className="rounded-xl border px-4 py-2 text-gray-900 bg-gray-50">
                        {money(finalPrice)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailContentLesson;