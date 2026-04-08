import { CheckCircle2, Info } from "lucide-react";

function Hero() {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    Tạo khoá học
                    </h1>
                    <p className="text-gray-600">
                    Điền thông tin cơ bản, xây dựng nội dung và xuất bản khoá học.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Hero;