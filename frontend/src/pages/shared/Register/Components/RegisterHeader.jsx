// src/pages/shared/Register/Components/RegisterHeader.jsx
import { Link } from "react-router-dom";

const BRAND = { primary: "#2563eb", primaryHover: "#1d4ed8" };

export default function RegisterHeader() {
    return (
        <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900">
                Tạo tài khoản PTIT E-Learning
            </h1>

            <div className="mt-3 flex items-center gap-2">
                <Link
                    to="/login"
                    className="rounded-full px-5 py-2 border transition"
                    style={{ borderColor: BRAND.primary, color: BRAND.primary }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                    Đăng nhập
                </Link>
                <button
                    type="button"
                    className="rounded-full px-5 py-2 text-white transition"
                    style={{ backgroundColor: BRAND.primary }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.primaryHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.primary)}
                >
                    Đăng ký
                </button>
            </div>

            <p className="mt-4 text-sm text-gray-600">
                Đăng ký để sử dụng đầy đủ tính năng và đồng bộ tiến độ học.
            </p>
        </div>
    );
}
