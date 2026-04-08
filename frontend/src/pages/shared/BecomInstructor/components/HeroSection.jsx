// src/pages/shared/BecomInstructor/components/HeroSection.jsx
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-700" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                            Tôi muốn làm giảng viên
                        </h1>
                        <p className="text-gray-600">
                            Nâng cấp vai trò từ học viên (student) lên giảng viên (teacher)
                            bằng mã xác thực.
                        </p>
                    </div>
                </div>
                <Link
                    to="/courses"
                    className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Về trang học tập
                </Link>
            </div>
        </section>
    );
}
