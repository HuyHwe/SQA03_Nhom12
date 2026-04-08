// src/pages/shared/Discover/Components/CourseList.jsx
import CourseCard from "./CourseCard";

export default function CourseList({ courses }) {
    if (courses.length === 0) {
        return (
            <div className="text-center text-gray-600 py-16 border rounded-2xl">
                Không tìm thấy khóa học phù hợp. Hãy thử từ khóa khác hoặc chọn "Tất cả".
            </div>
        );
    }

    return (
        <section className="space-y-6">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </section>
    );
}
