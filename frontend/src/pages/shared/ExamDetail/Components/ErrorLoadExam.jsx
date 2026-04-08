import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function ErrorLoadExam({err}){
    return (
        <div className="w-screen max-w-none bg-white">
            <main className="w-full px-6 lg:px-12 py-16">
                <div className="max-w-3xl">
                    <Link to="/exam" className="inline-flex items-center gap-2 mb-6 text-blue-600">
                        <ArrowLeft className="w-4 h-4" /> Quay lại thư viện đề thi
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h1>
                    <p className="text-gray-600">Chi tiết: {err}</p>
                </div>
            </main>
        </div>
    )
}

export default ErrorLoadExam;