import CourseCard from "./CourseCard";
import SkeletonCard from "./SkeletonCard";

function ListResult({ visibleCourses, loading }) {
    return (
        <section
            id="recommended"
            title="Khóa học gợi ý cho bạn"
            subtitle="Những khóa học được học viên yêu thích và đánh giá cao nhất"
        >
            {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4 px-6 lg:px-12">
                {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`s-${i}`} />
                ))}
            </div>
            ) : visibleCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4 px-6 lg:px-12">
                {visibleCourses.map((c) => (
                <CourseCard key={c.id} c={c} />
                ))}
            </div>
            ) : (
            <div className="text-center py-12 text-slate-500">
                Không tìm thấy khóa học nào phù hợp với từ khóa hoặc danh mục đã chọn.
            </div>
            )}
        </section>
    )
}

export default ListResult;