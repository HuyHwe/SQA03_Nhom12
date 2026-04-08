import { Link } from "react-router-dom";
import { Download, Plus } from "lucide-react";

function Hero() {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900"> Khoá học đã tạo</h1>
                    <p className="text-gray-600">Quản lý khoá học, trạng thái và cập nhật nội dung</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/i/courses/new"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Tạo khoá học
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Hero;