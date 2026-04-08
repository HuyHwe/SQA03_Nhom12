import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

/**
 * Forbidden Page (403)
 * Shown when user is authenticated but doesn't have permission to access a resource
 */
export default function Forbidden() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-red-100 p-6">
                        <ShieldX className="w-16 h-16 text-red-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Không có quyền truy cập
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Quay lại
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors font-medium"
                    >
                        Về trang chủ
                    </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 text-sm text-gray-500">
                    <p>Các quyền truy cập:</p>
                    <ul className="mt-2 space-y-1">
                        <li>🎓 Học viên - Truy cập khóa học và thi</li>
                        <li>👨‍🏫 Giảng viên - Tạo và quản lý khóa học</li>
                        <li>👨‍💼 Quản trị - Quản lý toàn hệ thống</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
