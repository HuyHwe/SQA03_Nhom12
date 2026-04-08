import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BackToLesson() {
    const navigate = useNavigate();
    return (
        <section className="w-full px-6 lg:px-12 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
            <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-2 text-blue-600 bg-transparent border-none"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
        </div>
      </section>
    )
}

export default BackToLesson;