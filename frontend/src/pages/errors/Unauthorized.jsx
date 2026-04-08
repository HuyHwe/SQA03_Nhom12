import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

/**
 * Unauthorized Page (401)
 * Shown when user tries to access a protected route without being logged in
 */
export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="rounded-full bg-yellow-100 p-6">
                        <ShieldAlert className="w-16 h-16 text-yellow-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">401</h1>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    Chưa đăng nhập
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    Bạn cần đăng nhập để truy cập trang này. Vui lòng đăng nhập để tiếp tục.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/login"
                        state={{ from: window.location.pathname }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors font-medium"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
