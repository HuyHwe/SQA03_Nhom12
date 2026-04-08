import { Users } from "lucide-react";

function CommonStats( { stats } ) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600 flex items-center gap-2"><Users className="w-4 h-4" /> Tổng ghi danh</div>
                <div className="mt-2 text-2xl font-extrabold text-blue-700">{stats.totalEnrollments}</div>
                <div className="text-xs text-gray-500 mt-1">Trên {stats.totalCourses} khoá</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600">Khoá đã publish</div>
                <div className="mt-2 text-2xl font-extrabold text-emerald-700">{stats.totalPublishedCourses}</div>
                <div className="text-xs text-gray-500 mt-1">Đang mở ghi danh</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600">Bản nháp</div>
                <div className="mt-2 text-2xl font-extrabold text-gray-900">{stats.totalDraftCourses}</div>
                <div className="text-xs text-gray-500 mt-1">Chờ xuất bản</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600">Đang chờ duyệt</div>
                <div className="mt-2 text-2xl font-extrabold text-yellow-400">{stats.totalPendingCourses}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
                <div className="text-sm text-gray-600">Bị từ chối</div>
                <div className="mt-2 text-2xl font-extrabold text-red-500">{stats.totalRejectedCourses}</div>
            </div>
        </div>
    )
}

export default CommonStats;