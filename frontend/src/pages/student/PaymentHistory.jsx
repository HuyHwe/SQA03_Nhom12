"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Home,
    Newspaper,
    User,
    Calendar,
    BookOpen,
    Users,
    GraduationCap,
    Award,
    Beaker,
    MoreHorizontal,
    CreditCard,
    Wallet,
    History,
    Filter,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import DataTable from "../../components/ui/DataTable";

/* ================= Mock Data ================= */
const TRANSACTIONS = [
    {
        id: "2903960166",
        content: "Học phí kỳ 1 năm học 2025-2026",
        amount: 8400000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "22:19 25/10/2025",
        completedDate: "22:20 25/10/2025",
    },
    {
        id: "2908125854",
        content: "Học phí kỳ 2 năm học 2024-2025",
        amount: 10080000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "10:45 21/03/2025",
        completedDate: "10:46 21/03/2025",
    },
    {
        id: "3804922487",
        content: "Nộp tiền",
        amount: 884520,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "21:15 25/11/2024",
        completedDate: "04:16 26/11/2024",
    },
    {
        id: "9959067267",
        content: "Học phí HK1 năm học 2024-2025 MSV B21DCCN081",
        amount: 11970000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "14:13 04/11/2024",
        completedDate: "14:23 04/11/2024",
    },
    {
        id: "HTDXKFHKOW",
        content: "Chuyển viên cập nhật",
        amount: 50000,
        method: "Chuyển viên cập nhật",
        status: "success",
        date: "19:02 02/10/2024",
        completedDate: null,
    },
    {
        id: "IICLLNNVVS",
        content: "Học phí kỳ 2 năm học 2023-2024",
        amount: 11294025,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "19:01 02/10/2024",
        completedDate: "01:03 14/09/2021",
    },
    {
        id: "DMYGYDKCQW",
        content: "Học phí kỳ 1 năm học 2023-2024",
        amount: 1096000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "18:41 02/10/2024",
        completedDate: "11:11 18/02/2022",
    },
    {
        id: "NZDFVJTRDH",
        content: "Học phí kỳ 3 năm học 2022-2023",
        amount: 563220,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "18:19 02/10/2024",
        completedDate: "06:35 02/12/2022",
    },
    {
        id: "AEPUMRFLXT",
        content: "Học phí kỳ 2 năm học 2022-2023",
        amount: 915000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "18:10 02/10/2024",
        completedDate: "09:53 20/01/2023",
    },
    {
        id: "TYGSWZUNMJ",
        content: "Học phí kỳ 1 năm học 2022-2023",
        amount: 25000,
        method: "Chuyển khoản ngân hàng",
        status: "success",
        date: "18:03 02/10/2024",
        completedDate: "12:08 05/07/2023",
    },
    {
        id: "FAILED_TX_1",
        content: "Nộp tiền thất bại",
        amount: 500000,
        method: "Chuyển khoản ngân hàng",
        status: "failed",
        date: "10:00 01/10/2024",
        completedDate: null,
    },
    {
        id: "PENDING_TX_1",
        content: "Đang xử lý",
        amount: 2000000,
        method: "Chuyển khoản ngân hàng",
        status: "pending",
        date: "09:00 25/11/2025",
        completedDate: null,
    }
];

const SIDEBAR_ITEMS = [
    { icon: Home, label: "Trang chủ", path: "/s/dashboard" },
    { icon: Newspaper, label: "Tin tức", path: "#" },
    { icon: User, label: "Thông tin cá nhân", path: "/s/profile" },
    { icon: Calendar, label: "Lịch & Sự kiện", path: "/s/schedule" },
    { icon: BookOpen, label: "Lớp tín chỉ", path: "/s/enrollments" },
    { icon: Users, label: "Lớp hành chính", path: "#" },
    { icon: GraduationCap, label: "Học tập", path: "#", hasSubmenu: true },
    { icon: Award, label: "Rèn luyện", path: "#", hasSubmenu: true },
    { icon: Beaker, label: "Nghiên cứu khoa học", path: "#" },
    { icon: MoreHorizontal, label: "Khác", path: "#", hasSubmenu: true, active: true },
];

/* ================= Components ================= */

function Sidebar() {
    return (
        <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-64px)] shrink-0">
            <div className="p-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Dashboard & Học tập</div>
                <nav className="space-y-1">
                    {SIDEBAR_ITEMS.map((item, idx) => (
                        <div key={idx}>
                            <Link
                                to={item.path}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                                        ? "bg-red-50 text-red-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 ${item.active ? "text-red-500" : "text-slate-400"}`} />
                                    <span>{item.label}</span>
                                </div>
                                {item.hasSubmenu && (
                                    <svg className={`w-4 h-4 transition-transform ${item.active ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                )}
                            </Link>
                            {/* Submenu for "Khác" (Mock) */}
                            {item.active && (
                                <div className="ml-9 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                                    <Link to="#" className="block py-1.5 text-sm text-slate-600 hover:text-red-600">Dịch vụ một cửa</Link>
                                    <Link to="#" className="block py-1.5 text-sm text-slate-600 hover:text-red-600">Thư viện</Link>
                                    <div className="block py-1.5 text-sm font-medium text-red-600">Tài chính</div>
                                    <div className="ml-3 space-y-1 border-l border-slate-200 pl-3 mt-1">
                                        <Link to="#" className="block py-1 text-sm text-slate-600 hover:text-red-600">Công nợ</Link>
                                        <Link to="/s/payment-history" className="block py-1 text-sm font-medium text-red-600">Lịch sử giao dịch</Link>
                                        <Link to="#" className="block py-1 text-sm text-slate-600 hover:text-red-600">Ưu đãi thanh toán</Link>
                                    </div>
                                    <Link to="#" className="block py-1.5 text-sm text-slate-600 hover:text-red-600">Phản hồi</Link>
                                    <Link to="#" className="block py-1.5 text-sm text-slate-600 hover:text-red-600">Khảo sát</Link>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

function StatusBadge({ status }) {
    if (status === "success") {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Thành công</span>;
    }
    if (status === "pending") {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Đang xử lý</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Thất bại</span>;
}

export default function PaymentHistory() {
    const [activeTab, setActiveTab] = useState("all");

    const columns = [
        {
            header: "TT",
            accessorKey: "index",
            cell: (info) => info.row.index + 1,
            className: "w-12 text-center",
        },
        {
            header: "Mã GD",
            accessorKey: "id",
            className: "font-medium text-slate-900",
        },
        {
            header: "Nội dung",
            accessorKey: "content",
            className: "max-w-[200px] truncate",
        },
        {
            header: "Số tiền",
            accessorKey: "amount",
            cell: (info) => (
                <span className="font-medium">
                    {info.getValue().toLocaleString("vi-VN")} VND
                </span>
            ),
            className: "text-right",
        },
        {
            header: "Hình thức",
            accessorKey: "method",
            className: "text-slate-600",
        },
        {
            header: "Trạng thái",
            accessorKey: "status",
            cell: (info) => <StatusBadge status={info.getValue()} />,
            className: "text-center",
        },
        {
            header: "Người thực hiện",
            accessorKey: "user", // Mock empty
            cell: () => "-",
            className: "text-center text-slate-400",
        },
        {
            header: "Thực hiện",
            accessorKey: "date",
            className: "text-slate-600 text-xs",
        },
        {
            header: "Hoàn thành",
            accessorKey: "completedDate",
            cell: (info) => info.getValue() || "-",
            className: "text-slate-600 text-xs",
        },
        {
            header: "Thao tác",
            id: "actions",
            cell: () => (
                <div className="flex items-center justify-center gap-2">
                    <button className="p-1 text-slate-400 hover:text-blue-600 transition"><RotateCcw size={16} /></button>
                    <button className="p-1 text-slate-400 hover:text-red-600 transition"><XCircle size={16} /></button>
                </div>
            ),
            className: "text-center",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
                <Sidebar />

                <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Lịch sử thanh toán</h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-green-700 mb-2">
                                    <Wallet className="w-5 h-5" />
                                    <span className="font-medium">Tổng tiền đã nộp</span>
                                </div>
                                <div className="text-3xl font-bold text-green-700">47.078.165 ₫</div>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-red-700 mb-2">
                                    <DollarSignIcon />
                                    <span className="font-medium">Số dư hiện tại</span>
                                </div>
                                <div className="text-3xl font-bold text-red-700">0 ₫</div>
                            </div>
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white border rounded-xl p-4 mb-8 text-sm text-slate-600 shadow-sm">
                        <p className="font-medium text-slate-900 mb-1">Lưu ý:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><span className="font-bold text-red-600">KHÔNG HỦY</span> giao dịch khi đã thực hiện quét mã QR và chuyển khoản thành công.</li>
                            <li>Sau khi chuyển khoản, hệ thống cần chờ thông tin xác nhận từ phía ngân hàng. Sinh viên vui lòng đợi đến khi quá trình hoàn tất.</li>
                            <li>Số tiền nộp dư (nếu có) sẽ được hoàn lại vào <span className="font-bold">Số dư ví</span>, sinh viên có thể xem chi tiết trong menu Lịch sử giao dịch.</li>
                        </ul>
                    </div>

                    {/* Tabs & Table */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="border-b px-6 py-4 flex items-center gap-4 overflow-x-auto">
                            {["Nộp tiền", "Thanh toán", "Hoàn trả", "Tất cả giao dịch"].map((tab, idx) => {
                                const key = idx === 3 ? "all" : tab;
                                const isActive = activeTab === key || (key === "all" && activeTab === "all");
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                                ? "bg-slate-900 text-white"
                                                : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                            <div className="ml-auto flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                    <RotateCcw size={14} /> Tải lại
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                    <Filter size={14} /> Bộ lọc tùy chỉnh
                                </button>
                            </div>
                        </div>

                        <div className="p-0">
                            <DataTable
                                data={TRANSACTIONS}
                                columns={columns}
                                searchPlaceholder="Tìm kiếm giao dịch..."
                            />
                        </div>

                        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                            <span className="text-sm text-slate-500">Tổng số: <span className="font-bold text-red-600">{TRANSACTIONS.length}</span></span>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

function DollarSignIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    )
}
