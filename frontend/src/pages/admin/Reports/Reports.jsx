import { useEffect, useState } from "react";
import { Check, X, AlertCircle, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "../../../components/ui/Toast";

export default function Reports() {
    const { toast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State cho modal xác nhận xóa
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const appUser = localStorage.getItem("app_user");
        console.log("DEBUG: app_user value:", appUser);

        let token = appUser ? JSON.parse(appUser).token : null;
        
        // Nếu không thấy token trong app_user, thử tìm ở app_access_token
        if (!token) {
            token = localStorage.getItem("app_access_token");
        }

        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                console.log("Token Claims:", JSON.parse(jsonPayload));
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        } else {
            console.warn("Không tìm thấy token nào để decode (app_user.token hoặc app_access_token đều trống).");
        }
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const appUser = localStorage.getItem("app_user");
            let token = appUser ? JSON.parse(appUser).token : null;
            if (!token) {
                token = localStorage.getItem("app_access_token");
            }

            const response = await fetch("http://localhost:5102/api/Report", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Sắp xếp mới nhất lên đầu
                const sortedData = Array.isArray(data) 
                    ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [];
                setReports(sortedData);
            }
        } catch (error) {
            console.error("Lỗi khi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý tạm thời (cập nhật UI), bạn có thể thay thế bằng API call thực tế
    const handleStatusUpdate = async (id, newStatus) => {
        // Ví dụ: await fetch(`http://localhost:5102/api/Report/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    const handleDeleteClick = (report) => {
        setReportToDelete(report);
        setIsDeleteConfirmOpen(true);
        setOpenMenuId(null);
    };

    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;
        const report = reportToDelete;
        setIsDeleting(true);

        const appUser = localStorage.getItem("app_user");
        let token = appUser ? JSON.parse(appUser).token : null;
        if (!token) token = localStorage.getItem("app_access_token");

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        let deleteUrl = "";
        switch (report.targetType) {
            case "Discussion":
                deleteUrl = `http://localhost:5102/api/Discussion/${report.targetTypeId}`;
                break;
            case "Post":
                // Sử dụng deletehard cho Post
                deleteUrl = `http://localhost:5102/api/Posts/deletehard/${report.targetTypeId}`;
                break;
            case "ForumQuestion":
                deleteUrl = `http://localhost:5102/api/ForumQuestion/${report.targetTypeId}/hard`;
                break;
            default:
                alert("Loại đối tượng không hỗ trợ xóa: " + report.targetType);
                return;
        }

        try {
            // 1. Xóa nội dung
            const resDel = await fetch(deleteUrl, { method: "DELETE", headers });
            if (!resDel.ok && resDel.status !== 404) {
                throw new Error("Không thể xóa nội dung. Mã lỗi: " + resDel.status);
            }

            // 2. Xóa báo cáo
            const resReport = await fetch(`http://localhost:5102/api/Report/${report.id}`, {
                method: "DELETE",
                headers
            });

            if (resReport.ok) {
                setReports(prev => prev.filter(r => r.id !== report.id));
                toast({ title: "Thành công", description: "Đã xử lý vi phạm" });
            } else {
                toast({ title: "Cảnh báo", description: "Xóa nội dung thành công nhưng không thể xóa báo cáo.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
            setReportToDelete(null);
        }
    };

    const handleRejectReport = async (report) => {
        const appUser = localStorage.getItem("app_user");
        let token = appUser ? JSON.parse(appUser).token : null;
        if (!token) token = localStorage.getItem("app_access_token");

        try {
            const res = await fetch(`http://localhost:5102/api/Report/${report.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== report.id));
                toast({ title: "Thành công", description: "Thao tác thành công." });
            } else {
                toast({ title: "Lỗi", description: "Không thể xóa báo cáo.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } finally {
            setOpenMenuId(null);
        }
    };

    // Reset trang về 1 khi thay đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const filteredReports = filter === "All" 
        ? reports 
        : reports.filter(r => r.status === filter);

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Báo cáo vi phạm</h1>
                    <p className="text-gray-500">Quản lý các báo cáo từ người dùng</p>
                </div>
                <div className="flex gap-2">
                    {["All", "Pending", "Resolved", "Rejected"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === status 
                                ? "bg-blue-600 text-white" 
                                : "bg-white text-gray-600 hover:bg-gray-50 border"
                            }`}
                        >
                            {status === "All" ? "Tất cả" : status === "Pending" ? "Chờ xử lý" : status === "Resolved" ? "Đã xử lý" : "Đã từ chối"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border flex flex-col">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left relative">
                    <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 font-medium text-gray-600 text-sm">Ngày báo cáo</th>
                            <th className="p-4 font-medium text-gray-600 text-sm">Đối tượng</th>
                            <th className="p-4 font-medium text-gray-600 text-sm">Lý do</th>
                            <th className="p-4 font-medium text-gray-600 text-sm">Chi tiết</th>
                            <th className="p-4 font-medium text-gray-600 text-sm">Trạng thái</th>
                            <th className="p-4 font-medium text-gray-600 text-sm text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedReports.length > 0 ? (
                            paginatedReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm">
                                        <div className="font-medium text-gray-900">
                                            {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(report.createdAt).toLocaleTimeString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                            {report.targetType}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-1 font-mono truncate w-24" title={report.targetTypeId}>
                                            {report.targetTypeId}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">{report.reason}</td>
                                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={report.description}>
                                        {report.description}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {report.status === 'Pending' && (
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {openMenuId === report.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 py-1">
                                                        <button 
                                                            onClick={() => handleRejectReport(report)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Nội dung hợp lệ
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteClick(report)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            Xóa vi phạm
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-xl">
                        <span className="text-sm text-gray-500">
                            Hiển thị {filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredReports.length)} trong số {filteredReports.length} báo cáo
                        </span>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-gray-700 px-2">
                                Trang {currentPage} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa vi phạm"
                description="Bạn có chắc chắn muốn xóa nội dung này và chấp nhận báo cáo? Hành động này không thể hoàn tác."
                confirmText={isDeleting ? "Đang xử lý..." : "Xóa vi phạm"}
                isConfirming={isDeleting}
            />
        </div>
    );
}

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText, isConfirming }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-2 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">Huỷ</button>
                    <button onClick={onConfirm} disabled={isConfirming} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:bg-red-400">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};