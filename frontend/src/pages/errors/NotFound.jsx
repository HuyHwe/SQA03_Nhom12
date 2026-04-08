import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

/**
 * NotFound Page (404)
 * Shown when user navigates to a non-existent route
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-blue-100 p-6">
                        <FileQuestion className="w-16 h-16 text-blue-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Không tìm thấy trang
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn.
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
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Về trang chủ
                    </Link>
                </div>

                {/* Popular Links */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Hoặc truy cập:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/courses" className="text-blue-600 hover:underline text-sm">
                            Khóa học
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/exam" className="text-blue-600 hover:underline text-sm">
                            Đề thi
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/blog" className="text-blue-600 hover:underline text-sm">
                            Blog
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/about" className="text-blue-600 hover:underline text-sm">
                            Giới thiệu
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
