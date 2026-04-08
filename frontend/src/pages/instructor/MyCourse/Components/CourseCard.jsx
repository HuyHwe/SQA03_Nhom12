import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Users, FileClock, MoreVertical, Eye, Rocket, Undo2, Copy, Edit, Plus } from "lucide-react";
import PopupAlertConfirm from "../../../../components/PopupAlertConfirm";

const BADGE = (s) => {
    if (s === "draft") {
        return "bg-gray-100 text-gray-700";
    } else if (s === "pending") {
        return "bg-yellow-100 text-yellow-700";
    } else if (s === "rejected") {
        return "bg-red-100 text-red-700";
    } else if (s === "published") {
        return "bg-emerald-100 text-emerald-700";
    }
}

const formattedDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function CourseCard({ c, onRequestPublish, onAddExam }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openRejectInfo, setOpenRejectInfo] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <article key={c.id} className="rounded-2xl border bg-white p-5 hover:shadow-sm transition relative">
            {/* header */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{c.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${BADGE(c.status)}`}>{c.status}</span>
                        <span className="inline-flex items-center gap-1 text-gray-600">
                            <FileClock className="w-4 h-4" /> Thời gian tạo: {formattedDate(c.createdAt)}
                        </span>
                        {c.status === "draft" && (
                            <span className="inline-flex items-center gap-1 text-gray-600">
                                <Undo2 className="w-4 h-4" /> Lần cuối sửa: {formattedDate(c.updatedAt)}
                            </span>
                        )}
                        {c.status === "published" && (
                            <span className="inline-flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" /> {c.enrollmentCount} HV
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative shrink-0" ref={menuRef}>
                    <button
                        className="rounded-lg bg-transparent border p-2 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg z-10">
                            <Link
                                to={`/i/courses/${c.id}/exams`}
                                className="block px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Eye className="w-4 h-4" /> Xem bài kiểm tra
                            </Link>

                            {c.status === "rejected" && (
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setOpenRejectInfo(true);
                                    }}
                                >
                                    <Eye className="w-4 h-4" /> Xem lý do từ chối
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {c.status === "draft" && (
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <Link
                        to={`/i/courses/${c.id}/edit`}
                        className="rounded-lg border px-3 py-2 text-center hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Sửa
                    </Link>
                    <button
                        className="rounded-lg bg-transparent border px-3 py-2 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                        onClick={onRequestPublish}
                    >
                        <Rocket className="w-4 h-4" /> Yêu cầu Publish
                    </button>
                    <button
                        // to={`/i/courses/${c.id}/edit`}
                        onClick={onAddExam}
                        className="rounded-lg border px-3 py-2 text-center bg-transparent hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Thêm bài kiểm tra
                    </button>
                </div>
            )}
            {c.status === "pending" && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">

                </div>
            )}
            {c.status === "rejected" && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">

                </div>
            )}
            {c.status === "published" && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {/* <Link
                        to={`/i/courses/${c.id}/lessons`}
                        className="rounded-lg border px-3 py-2 text-center hover:bg-gray-50"
                    >
                        Quản lý bài học
                    </Link> */}
                </div>
            )}

            <PopupAlertConfirm
                open={openRejectInfo}
                title="Thông tin từ chối khoá học"
                message={
                    <div className="space-y-2 text-left">
                        <p>
                            <span className="font-medium">Trạng thái duyệt: </span>
                            {c.reviewStatus || c.ReviewStatus || "N/A"}
                        </p>
                        {(c.reviewByAdminName || c.ReviewByAdminName) && (
                            <p>
                                <span className="font-medium">Người duyệt: </span>
                                {c.reviewByAdminName || c.ReviewByAdminName}
                            </p>
                        )}
                        <p>
                            <span className="font-medium">Lý do từ chối: </span>
                            {c.rejectReason || c.RejectReason || "Không có lý do từ chối"}
                        </p>
                    </div>
                }
                confirmText="Đóng"
                cancelText="Đóng"
                onConfirm={() => setOpenRejectInfo(false)}
                onCancel={() => setOpenRejectInfo(false)}
            />
        </article>
    )
}

export default CourseCard;