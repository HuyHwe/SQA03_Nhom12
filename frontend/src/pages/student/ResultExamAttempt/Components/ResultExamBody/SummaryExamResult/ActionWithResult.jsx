import { Link } from "react-router-dom";
import { RotateCcw, ArrowLeft, BookOpen, Download } from "lucide-react";

function ActionWithResult( { examId }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Link
                to={`/s/exam/${examId}`}
                className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Quay lại bài thi
            </Link>
            <Link
                to="/courses"   
                className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm font-medium"
            >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Khóa học liên quan
            </Link>
            {/* <button
                onClick={onExportCSV}
                className="rounded-xl border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm font-medium"
            >
                <Download className="w-4 h-4 inline mr-2" />
                Xuất CSV
            </button> */}
            {/* <Link
                
                className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm font-medium"
            >
                Lịch sử
            </Link> */}
        </div>
    )
}

export default ActionWithResult;