import { Outlet, Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    DollarSign,
    FileText,
    BarChart,
    Settings,
    LogOut,
    Flag
} from "lucide-react";

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
        { path: "/admin/courses", icon: GraduationCap, label: "Quản lý khóa học" },
        // { path: "/admin/users", icon: Users, label: "Quản lý người dùng" },
        // { path: "/admin/refunds", icon: DollarSign, label: "Hoàn tiền" },
        // { path: "/admin/payouts", icon: FileText, label: "Thanh toán GV" },
        // { path: "/admin/analytics", icon: BarChart, label: "Thống kê" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản trị hệ thống</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = "/admin/login";
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
