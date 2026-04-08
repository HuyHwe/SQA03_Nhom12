import { useState, useEffect, useRef } from "react";
import { adminRejectCourse, getCoursesByStatusByAdmin } from "../../../api/admin.api";
import { CardSkeleton } from "../../../components/ui/Skeleton";
import Actions from "./Components/Actions";
import NoCourse from "./Components/NoCourse";
import CourseList from "./Components/CourseList/CourseList";

import Pagination from "../../../components/Pagination";
import PopupAlertConfirm from "../../../components/PopupAlertConfirm";

import { adminApproveCourse } from "../../../api/admin.api";

export default function CourseApprovals() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [rejectReason, setRejectReason] = useState("");

    const [openPopupAccept, setopenPopupAccept] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
    const [openPopupReject, setopenPopupReject] = useState(false);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const cacheRef = useRef(new Map());

    const hanleOpenConfirmAccept = (courseId, courseTitle) => {
        setSelectedCourseId(courseId);
        setSelectedCourseTitle(courseTitle);
        setopenPopupAccept(true);
    }

    const handleOpenConfirmReject = (courseId, courseTitle) => {
        setSelectedCourseId(courseId);
        setSelectedCourseTitle(courseTitle);
        setopenPopupReject(true);
    }

    const handleConfirmAccept = async () => {
        try{
            const res = await adminApproveCourse(selectedCourseId);
            alert(res.message || "Duyệt khoá học thành công!");
            window.location.reload();
        } catch (e) {
            alert("Duyệt khoá học thất bại: " + e.message);
        } finally {
            setopenPopupAccept(false);
        }
    }

    const handleConfirmReject = async () => {
        try{
            const res = await adminRejectCourse(selectedCourseId, rejectReason);
            alert(res.message || "Từ chối duyệt khoá học thành công!");
            window.location.reload();
        } catch (e) {
            alert("Từ chối duyệt khoá học thất bại: " + e.message);
        } finally {
            setopenPopupReject(false);
        }
    }

    async function loadCourses(params = {}){
        const key = JSON.stringify(params);

        if (cacheRef.current.has(key)) {
            const cached = cacheRef.current.get(key);
            setCourses(cached.courses);
            setTotalPages(cached.totalPages);
            setCurrentPage(cached.currentPage);
            return;
        }

        try {
            setLoading(true);
            const result = await getCoursesByStatusByAdmin(params);
            const list = Array.isArray(result.data.courses) ? result.data.courses : [];

            const data = {
                courses: list,
                totalPages: result.data.totalPages || 1,
                currentPage: result.data.currentPage || 1,
            };
            cacheRef.current.set(key, data);

            setCourses(list);
            setTotalPages(result.data.totalPages || 1);
            setCurrentPage(result.data.currentPage || 1);
        } catch (error) {
            setError("Lỗi khi tải danh sách khóa học");
            console.error("Load courses error:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        setCurrentPage(1);
        loadCourses({status: statusFilter, page: 1});
    }, [statusFilter]);

    if(loading) return (
        <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>
    )

    if(error) return (<div className="text-red-500"> {error} </div>)

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
                <p className="text-gray-600 mt-2">Duyệt và quản lý các yêu cầu cập nhật khóa học</p>
            </div>

            <Actions 
                statusFilter={statusFilter} 
                setStatusFilter={setStatusFilter}
            />

            {courses.length === 0 ? (
                <NoCourse />
            ) : (
                <>
                    <CourseList
                        courses={courses}
                        statusFilter={statusFilter}
                        onApproveClick={hanleOpenConfirmAccept}
                        onRejectClick={handleOpenConfirmReject}
                    />
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={(page) => {
                            loadCourses({status: statusFilter, page})
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                    />
                </>
            )}

            <PopupAlertConfirm
                open={openPopupAccept}
                title="Xác nhận phê duyệt khóa học"
                message={
                    <>
                        Bạn có chắc chắn muốn phê duyệt khóa học{" "}
                        <strong>"{selectedCourseTitle}"</strong> không? 
                        Hành động này sẽ công khai khóa học cho người dùng.
                    </>
                }
                confirmText="Phê duyệt"
                cancelText="Hủy"
                onConfirm={handleConfirmAccept}
                onCancel={() => setopenPopupAccept(false)}
            />

            <PopupAlertConfirm
                open={openPopupReject}
                title="Xác nhận từ chối khóa học"
                message={
                    <>
                        Bạn có chắc chắn muốn từ chối khóa học{" "}
                        <strong>"{selectedCourseTitle}"</strong> không? 
                        Hành động này sẽ gửi khóa học trở lại cho giảng viên để chỉnh sửa.
                    </>
                }
                confirmText="Từ chối"
                cancelText="Hủy"
                onConfirm={handleConfirmReject}
                onCancel={() => {
                    setopenPopupReject(false)
                    setRejectReason("")}}
                needReason={true}
                reasonLabel="Lý do từ chối khóa học"
                reasonText={rejectReason}
                onChangeReasonText={setRejectReason}
            />
        </div>
    );
}
