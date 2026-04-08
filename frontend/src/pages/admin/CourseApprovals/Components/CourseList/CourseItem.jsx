import { useState } from "react";
import { Check, X, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";

import PopupAlertConfirm from "../../../../../components/PopupAlertConfirm";

const getStatusBadge = (status) => {
        const badges = {
            pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800", icon: Clock },
            published: { label: "Đã duyệt", className: "bg-green-100 text-green-800", icon: CheckCircle },
            rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-800", icon: XCircle },
        };
        const badge = badges[status?.toLowerCase()] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    };

function CourseItem({ course, statusFilter, setCourseReview }) {
    const [openRejectReason, setOpenRejectReason] = useState(false);

    return (
        <div key={course.id} className="bg-white rounded-lg shadow-sm border p-6" onClick={() => setCourseReview(course)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900">{course.title || course.name}</h3>
                        {getStatusBadge(course.status)}
                        {course.reviewStatus === 'InReview' && course.reviewByAdminName && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <UserCheck className="w-4 h-4" />
                                Đang được duyệt bởi {course.reviewByAdminName}
                            </span>
                        )}
                        {course.reviewStatus === 'Reviewed' && course.reviewByAdminName && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                <UserCheck className="w-4 h-4" />
                                Đã được duyệt bởi {course.reviewByAdminName}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.description || "Không có mô tả"}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Giảng viên:</span>
                            <p className="font-medium text-gray-900">{course.teacherName || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Thể loại:</span>
                            <p className="font-medium text-gray-900">{course.categoryName || "N/A"}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Giá:</span>
                            <p className="font-medium text-gray-900">
                                {course.price?.toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                    </div>
                </div>

                {statusFilter === "pending" && (
                    <div className="flex flex-col gap-2 ml-6">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Xem
                        </button>
                    </div>
                )}

                {statusFilter === "rejected" && course.rejectReason && (
                    <div className="flex flex-col gap-2 ml-6">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenRejectReason(true);
                            }}
                        >
                            Xem lý do từ chối
                        </button>
                    </div>
                )}
            </div>

            <PopupAlertConfirm
                open={openRejectReason}
                title="Lý do từ chối khóa học"
                message={course.rejectReason || "Không có lý do từ chối"}
                confirmText="Đóng"
                cancelText="Đóng"
                onConfirm={() => setOpenRejectReason(false)}
                onCancel={() => setOpenRejectReason(false)}
            />
        </div>
    )
}

export default CourseItem;