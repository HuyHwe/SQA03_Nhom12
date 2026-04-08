import { useEffect, useState } from "react";
import { GraduationCap, Users, DollarSign, TrendingUp } from "lucide-react";
// import { getCoursesByStatus } from "../../api/admin.api";

/**
 * AdminDashboard - Overview statistics for admin
 */
export default function AdminDashboard() {
    // const [stats, setStats] = useState({
    //     pendingCourses: 0,
    //     approvedCourses: 0,
    //     totalUsers: 0, // Placeholder until backend API exists
    //     revenue: 0, // Placeholder
    // });
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     loadStats();
    // }, []);

    // const loadStats = async () => {
    //     try {
    //         // Load pending courses count
    //         const pendingData = await getCoursesByStatus("pending");
    //         const approvedData = await getCoursesByStatus("approved");

    //         setStats({
    //             pendingCourses: pendingData?.data?.length || 0,
    //             approvedCourses: approvedData?.data?.length || 0,
    //             totalUsers: 0, // TODO: Add API when backend ready
    //             revenue: 0, // TODO: Add API when backend ready
    //         });
    //     } catch (error) {
    //         console.error("Load stats error:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const statCards = [
        {
            title: "Khóa học chờ duyệt",
            // value: stats.pendingCourses,
            icon: GraduationCap,
            color: "bg-yellow-500",
            link: "/admin/courses"
        },
        {
            title: "Khóa học đã duyệt",
            // value: stats.approvedCourses,
            icon: GraduationCap,
            color: "bg-green-500",
        },
        {
            title: "Tổng người dùng",
            // value: stats.totalUsers,
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Doanh thu",
            // value: `${stats.revenue.toLocaleString("vi-VN")}đ`,
            icon: TrendingUp,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Tổng quan hệ thống E-learning</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {loading ? "..." : stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            {stat.link && (
                                <a
                                    href={stat.link}
                                    className="text-blue-600 text-sm mt-4 inline-block hover:underline"
                                >
                                    Xem chi tiết →
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/courses"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-900">Duyệt khóa học</p>
                            <p className="text-sm text-gray-500">Quản lý yêu cầu</p>
                        </div>
                    </a>
                    <a
                        // href="/admin/users"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-900">Quản lý người dùng</p>
                            <p className="text-sm text-gray-500">Tạo/sửa/xóa</p>
                        </div>
                    </a>
                    <a
                        // href="/admin/analytics"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-900">Thống kê</p>
                            <p className="text-sm text-gray-500">Xem báo cáo</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
