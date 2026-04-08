import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import ExamFilters from "./components/ExamFilters";
import ExamTable from "./components/ExamTable";
import Pagination from "../../../components/Pagination";
import { fetchAllExamsForCourse } from "../../../api/exams.api";

function CourseExams() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const pageSize = 10;

    async function loadExams(params = {}) {
        try {
            setLoading(true);
            setError("");

            const result = await fetchAllExamsForCourse(courseId, {
                ...params,
                pageSize,
            });

            if (result.status === "success") {
                setExams(result.data.items || []);
                setCurrentPage(result.data.currentPage || 1);
                setTotalPages(result.data.totalPages || 1);
                setTotalCount(result.data.totalCount || 0);
            } else {
                setError(result.message || "Không thể tải danh sách bài kiểm tra");
            }
        } catch (err) {
            console.error("Load exams error:", err);
            setError("Không thể tải danh sách bài kiểm tra. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadExams({ status, sort, page: 1 });
    }, [status, sort]);

    const handleSearch = () => {
        loadExams({ keyword, status, sort, page: 1 });
    };

    const handlePageChange = (page) => {
        loadExams({ keyword, status, sort, page });
    };

    const handleEdit = (examId) => {
        // Navigate to edit page (placeholder for now)
        console.log("Edit exam:", examId);
        // navigate(`/i/exams/${examId}/edit`);
    };

    const handleToggleOpen = (examId, currentStatus) => {
        // Placeholder for toggle open/close logic
        console.log("Toggle open for exam:", examId, "Current status:", currentStatus);
        alert("Chức năng này sẽ được triển khai sau");
    };

    if (loading) {
        return (
            <div className="min-h-screen w-screen max-w-none bg-gray-50 px-6 lg:px-12 py-8">
                <div className="text-center text-gray-600">Đang tải danh sách bài kiểm tra...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-screen max-w-none bg-gray-50 px-6 lg:px-12 py-8">
                <div className="text-center text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen max-w-none bg-gray-50">
            <div className="px-6 lg:px-12 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/i/courses")}
                            className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Quản lý bài kiểm tra
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Tổng số: {totalCount} bài kiểm tra
                            </p>
                        </div>
                    </div>
                    <Link
                        to={`/i/courses/${courseId}/exams/create`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo bài kiểm tra mới
                    </Link>
                </div>

                {/* Filters */}
                <ExamFilters
                    keyword={keyword}
                    setKeyword={setKeyword}
                    status={status}
                    setStatus={setStatus}
                    sort={sort}
                    setSort={setSort}
                    onSearch={handleSearch}
                />

                {/* Table */}
                <ExamTable
                    exams={exams}
                    onEdit={handleEdit}
                    onToggleOpen={handleToggleOpen}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}

export default CourseExams;
