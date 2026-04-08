import { useState, useEffect } from "react";

import { Clock, CheckCircle, XCircle, Swords } from "lucide-react";
import { Primary } from "../../../../../components/Buttons.jsx";

import {
    getFullCourseById,
    occupyReviewSlot,
    // getLessonById,
} from "../../../../../api/admin.api.js";
import { getUserFromToken } from "../../../../../utils/auth.js";
import LessonDetailPopup from "./LessonDetailPopup.jsx";

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

function CourseItemReview({ course, statusFilter, actionLoading, onApproveClick, onRejectClick }) {
    const [fullCourse, setFullCourse] = useState(null);
    const [selectedLessonId, setSelectedLessonId] = useState(null);

    const currentAdmin = getUserFromToken();
    const currentAdminId = currentAdmin?.adminId ?? currentAdmin?.userId;
    const isReviewer = fullCourse?.reviewByAdminId && fullCourse.reviewByAdminId === currentAdminId;

    useEffect(() => {
        if (!course?.id) {
            setFullCourse(null);
            return;
        }

        const controller = new AbortController();
        setFullCourse(null);

        (async () => {
            try {
                const result = await getFullCourseById(course.id, {
                    signal: controller.signal
                });
                setFullCourse(result.data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error fetching full course:", error);
                }
            }
        })();

        return () => controller.abort();
    }, [course?.id]);

    const handleLessonClick = (lessonId) => {
        setSelectedLessonId(lessonId);
    };

    const handleClosePopup = () => {
        setSelectedLessonId(null);
    };

    if (!course || !course.id) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500 h-full flex items-center justify-center">
                <p>Chọn một khóa học để xem chi tiết</p>
            </div>
        );
    }

    if (!fullCourse) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500 h-full flex items-center justify-center">
                <p>Đang tải dữ liệu khóa học...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-3xl font-bold text-gray-900">{fullCourse.title}</h3>
                        {getStatusBadge(fullCourse.status)}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {fullCourse.thumbnailUrl && (
                    <div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Ảnh bìa</h4>
                        <img src={fullCourse.thumbnailUrl} alt={fullCourse.title} className="rounded-lg w-full object-cover" />
                    </div>
                )}
                <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Mô tả chi tiết</h4>
                    <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: fullCourse.description?.replace(/\n/g, '<br />') }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50 p-6 rounded-lg">
                    <div>
                        <span className="text-sm text-gray-500">Giảng viên</span>
                        <p className="font-semibold text-lg text-gray-900">{fullCourse.teacherName || "Chưa xác định"}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Thể loại</span>
                        <p className="font-semibold text-lg text-gray-900">{fullCourse.categoryName || "Chưa xác định"}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Giá khóa học</span>
                        <p className="font-semibold text-lg text-green-600">
                            {fullCourse.price ? `${fullCourse.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Giảm giá</span>
                        <p className="font-semibold text-lg text-gray-900">{fullCourse.discount}%</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Ngày gửi yêu cầu</span>
                        <p className="font-semibold text-lg text-gray-900">
                            {fullCourse.createdAt ? new Date(fullCourse.createdAt).toLocaleDateString("vi-VN") : "Không rõ"}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <span className="text-sm text-gray-500">Cập nhật lần cuối</span>
                        <p className="font-semibold text-lg text-gray-900">
                            {fullCourse.updatedAt ? new Date(fullCourse.updatedAt).toLocaleString("vi-VN") : "Không rõ"}
                        </p>
                    </div>
                    {fullCourse.reviewByAdminName && (
                        <div className="col-span-2">
                            <span className="text-sm text-gray-500">Người duyệt</span>
                            <p className="font-semibold text-lg text-gray-900">{fullCourse.reviewByAdminName}</p>
                        </div>
                    )}
                </div>

                {fullCourse.courseContent && fullCourse.courseContent.lessons && fullCourse.courseContent.lessons.length > 0 && (
                    <div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Nội dung khóa học</h4>
                        <ul className="space-y-3">
                            {fullCourse.courseContent.lessons.sort((a, b) => a.order - b.order).map(lesson => (
                                <li 
                                    key={lesson.id} 
                                    className={`
                                        p-3 rounded-md flex justify-between items-center transition-colors
                                        ${isReviewer
                                            ? "bg-gray-50 cursor-pointer hover:bg-gray-100"
                                            : "bg-gray-200 cursor-not-allowed pointer-events-none"
                                        }
                                    `}
                                    onClick={isReviewer ? () => handleLessonClick(lesson.id) : undefined}
                                >
                                    <span className="font-medium">Bài {lesson.order}: {lesson.title}</span>
                                    <span className="text-sm text-gray-600">{lesson.duration} phút</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {statusFilter === "pending" && (
                    <div className="flex items-center justify-end gap-4 pt-6 border-t mt-8">
                        <Primary
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2"
                            onClick={() => { occupyReviewSlot(course.id) }}
                            disabled={!!fullCourse.reviewByAdminId || actionLoading}
                        >
                            <Swords className="w-5 h-5" />
                            Review
                        </Primary>
                        {fullCourse.reviewStatus === "InReview" && isReviewer && (
                            <>
                                <Primary
                                    variant="outline"
                                    size="lg"
                                    className="flex items-center gap-2"
                                    onClick={() => onRejectClick(course.id, course.title)}
                                    disabled={actionLoading}
                                >
                                    <XCircle className="w-5 h-5" />
                                    Từ chối
                                </Primary>
                                <Primary
                                    size="lg"
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => onApproveClick(course.id, course.title)}
                                    disabled={actionLoading}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Phê duyệt
                                </Primary>
                            </>
                        )}
                    </div>
                )}
            </div>
            <LessonDetailPopup courseId={course.id} lessonId={selectedLessonId} onClose={handleClosePopup} />
        </div>
    );
}

export default CourseItemReview;
