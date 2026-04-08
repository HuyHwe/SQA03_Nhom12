import Layout from "../../../../components/Layout";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function ErrorLoadingLesson({ error, lessonId }) {
    return (
      <div className="min-h-screen bg-white">
          <main className="w-full px-6 lg:px-12 py-16">
            <div className="max-w-3xl">
              <Link to="/s/enrollments" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
                <ChevronLeft className="w-4 h-4" /> Về “Khóa học của tôi”
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {error || "Không tìm thấy bài học"}
              </h1>
              <p className="text-gray-600">ID: {lessonId}</p>
            </div>
          </main>
      </div>
    );
}

export default ErrorLoadingLesson;