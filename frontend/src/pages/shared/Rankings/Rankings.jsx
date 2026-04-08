import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import StatsTable from "./components/StatsTable";
import TopThreePodium from "./components/TopThreePodium";
import { getStats, checkTeacherEligibility } from "./forumService";

const TABS = {
    CONTRIBUTORS: 'contributors',
    STATS: 'stats',
};

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
}

function ErrorDisplay({ message }) {
    return (
        <div className="text-center py-10 px-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-semibold">Đã có lỗi xảy ra</p>
            <p>{message || "Không thể tải dữ liệu. Vui lòng thử lại sau."}</p>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex items-center justify-end gap-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Trang trước
            </button>
            <div className="text-sm text-gray-700">
                Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Trang sau
            </button>
        </div>
    );
}

function CurrentUserStatCard({ userStat, eligibility }) {
    if (!userStat) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Thống kê của bạn</h3>
                <p className="text-gray-600">Bạn chưa có điểm trong bảng xếp hạng.</p>
            </div>
        );
    }

    const { rank, fullName, contributionScore, totalContributionScore } = userStat;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Thống kê của bạn</h3>
            <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-500 w-10 text-center">{rank}</div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-900 truncate" title={fullName}>{fullName}</p>
                    <p className="text-sm text-gray-500">
                        Điểm tháng này: <span className="font-bold text-blue-600">{contributionScore}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Tổng điểm: <span className="font-bold text-blue-600">{totalContributionScore}</span>
                    </p>
                </div>
            </div>
            {eligibility.isEligible && (
                <Link to="/i/become-instructor" className="block mt-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors duration-200">
                        <p className="text-sm font-semibold text-green-800">
                            Bạn đủ điều kiện nâng cấp làm giảng viên
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            Nhấn vào đây để bắt đầu quá trình nâng cấp.
                        </p>
                    </div>
                </Link>
            )}
        </div>
    );
}

// Helper function to get studentId from token
const getStudentIdFromToken = () => {
    const token = localStorage.getItem("app_access_token");
    if (!token) {
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        // Prefer 'StudentId' (uppercase) then 'studentId' (lowercase)
        return decoded.StudentId || decoded.studentId || null;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};

export default function Rankings() {
    const [currentMonth, setCurrentMonth] = useState(undefined); // Mặc định là "Tất cả"
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const studentId = useMemo(() => getStudentIdFromToken(), []);
    
    const { data: statsData, isLoading: isLoadingStats, error: statsError } = useQuery({
        queryKey: ['stats', { month: currentMonth }],
        queryFn: () => getStats(currentMonth),
    });

    // Sử dụng useQuery để gọi API kiểm tra điều kiện làm giảng viên
    const { data: isEligibleForTeacher } = useQuery({
        queryKey: ['teacherEligibility', studentId],
        queryFn: () => checkTeacherEligibility(),
        enabled: !!studentId, // Chỉ chạy query khi có studentId
    });

    const handleMonthChange = (event) => {
        const value = event.target.value;
        setCurrentMonth(value === "" ? undefined : parseInt(value, 10));
        setCurrentPage(1); // Reset về trang đầu khi đổi tháng
    };

    const processedStats = useMemo(() => {
        if (!statsData) {
            return { topThree: [], others: [], currentUserStat: null };
        }



        const isMonthView = currentMonth !== undefined;

        const sorted = [...statsData]
            .map(student => {
                const posts = isMonthView ? student.monthPosts : student.totalPosts;
                const questions = isMonthView ? student.monthForumQuestions : student.totalForumQuestions;
                const discussions = isMonthView ? student.monthDiscussions : student.totalDiscussions;
                const contributionScore = (posts * 20) + (questions * 5) + (discussions * 1);
                
                const totalContributionScore = (student.totalPosts * 20) + (student.totalForumQuestions * 5) + (student.totalDiscussions * 1);

                return { ...student, contributionScore, totalContributionScore };
            })
            .sort((a, b) => b.contributionScore - a.contributionScore);

        // 3. Tìm thông tin và thứ hạng của người dùng hiện tại
        // Đã sửa: Tìm kiếm theo 'studentId' thay vì '_id'
        const currentUserIndex = studentId ? sorted.findIndex(stat => stat.studentId === studentId) : -1;
        const currentUserStat = currentUserIndex !== -1 ? { ...sorted[currentUserIndex], rank: currentUserIndex + 1 } : null;

        return { 
            topThree: sorted.slice(0, 3),
            others: sorted.slice(3),
            currentUserStat,
        };
    }, [statsData, currentMonth, studentId]);

    const isLoading = isLoadingStats;
    const error = statsError;

    const totalPages = Math.ceil(processedStats.others.length / ITEMS_PER_PAGE);
    const paginatedOthers = processedStats.others.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Thẻ thống kê người dùng - Cố định ở góc trên bên phải */}
                <div className="hidden lg:block fixed top-28 right-8 w-64 xl:w-72 z-10">
                    {studentId && (
                        <CurrentUserStatCard 
                            userStat={processedStats.currentUserStat} 
                            eligibility={{ isEligible: isEligibleForTeacher, reason: 'Đủ điều kiện theo quy định của hệ thống.' }} 
                        />
                    )}
                </div>

                <TopThreePodium topThree={processedStats.topThree} />
                
                <div className="mt-12">
                    <div className="lg:w-[48rem] min-w-0 mx-auto">
                        {/* Header của bảng */}
                        <div className="relative border-b border-gray-200 pb-5 sm:pb-0">
                            <div className="md:flex md:items-center md:justify-between">
                                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                    Bảng thống kê
                                </h2>
                                <div className="mt-4 flex md:absolute md:right-0 md:top-0 md:mt-0">
                                    <select onChange={handleMonthChange} value={currentMonth ?? ''} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
                                        <option value="">Tất cả</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isLoading && <LoadingSpinner />}
                        {error && <ErrorDisplay message={error.message} />}

                        {!isLoading && !error && (
                            <>
                                {paginatedOthers.length > 0 ? (
                                    <>
                                        <StatsTable stats={paginatedOthers} currentMonth={currentMonth} />
                                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">Không có dữ liệu để hiển thị.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}
