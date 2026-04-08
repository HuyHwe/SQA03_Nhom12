import { Link } from "react-router-dom"
import { Globe2, Eye, Users, Timer, DollarSign, BookOpen, CheckCircle2, ImageIcon } from "lucide-react"
import { useState } from "react";
import { useMemo } from "react";

const nf = new Intl.NumberFormat("vi-VN");
const money = (v) => nf.format(v) + "đ";

function PreviewSection( { 
    outcomes,
    requirements,
    course, courseContent }) {
        const [, setShowPreview] = useState(false);
        const handleShowPreview = () => {
            console.log("Course:", course);
            console.log("Course Content:", courseContent);
            setShowPreview((prev) => !prev);
        };

        const finalPrice = useMemo(() => {
            const pct = Math.min(100, Math.max(0, Number(course.discount) || 0));
            const base = Math.max(0, Number(course.price) || 0);
            return Math.max(0, base - Math.floor((base * pct) / 100));
        }, [course.price, course.discount]);

    return (
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="aspect-video bg-gray-100 grid place-items-center text-gray-500">
                    {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <span className="inline-flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> Thumbnail Preview
                    </span>
                    )}
                </div>
                <div className="p-5">
                    <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">
                        {course.title || "Tiêu đề khoá học"}
                    </h2>
                    <p className="text-sm text-gray-700 mt-1">
                        {course.description || "Mô tả khoá học"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1" style={{ whiteSpace: "pre-line" }}>
                        {"\nKết quả học tập:\n" + outcomes.map(r => `- ${r}`).join("\n")}
                    </p>
                    <p className="text-sm text-gray-700 mt-1" style={{ whiteSpace: "pre-line" }}>
                        {"Yêu cầu:\n" + requirements.map(r => `- ${r}`).join("\n")}
                    </p>
                    <div className="mt-3 text-sm text-gray-700 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            {courseContent.lessons.length} bài học
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <DollarSign className="w-4 h-4" /> {money(finalPrice)}
                        </span>
                    </div>

                    <h2 className="text-base font-semibold text-gray-900 ">
                        Danh mục: {course.categoryName || "Chưa chọn"}
                    </h2>

                    <h4 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {courseContent.title || "Giới thiệu khóa học"}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                        {courseContent.introduce || "Mô tả chi tiết"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <button onClick={handleShowPreview}
                            className="rounded-lg bg-transparent border px-3 py-2 hover:bg-gray-50 inline-flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" /> Xem trang public
                        </button>
                        <Link
                            to="/i/courses"
                            className="rounded-lg border px-3 py-2 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" /> Về danh sách
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default PreviewSection;