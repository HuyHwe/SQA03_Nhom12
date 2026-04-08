import { Edit, Lock, Unlock } from "lucide-react";

function ExamTable({ exams, onEdit, onToggleOpen }) {
    if (!exams || exams.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                Không có bài kiểm tra nào
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Tiêu đề
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Mô tả
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Thời gian (phút)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Lượt hoàn thành
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Loại
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Liên kết đến
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {exams.map((exam) => (
                        <tr key={exam.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {exam.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                {exam.description || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {exam.durationMinutes}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {exam.totalCompleted}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                {exam.isOpened ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                        <Unlock className="w-3 h-3" /> Đang mở
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                        <Lock className="w-3 h-3" /> Đã đóng
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {exam.lessonId ? "Bài học" : "Khóa học"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {exam.lessonTitle || exam.courseTitle || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(exam.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        <Edit className="w-3 h-3" /> Sửa
                                    </button>
                                    <button
                                        onClick={() => onToggleOpen(exam.id, exam.isOpened)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        {exam.isOpened ? (
                                            <>
                                                <Lock className="w-3 h-3" /> Đóng
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-3 h-3" /> Mở
                                            </>
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ExamTable;
