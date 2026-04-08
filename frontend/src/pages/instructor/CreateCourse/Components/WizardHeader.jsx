import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function WizardHeader( { step, setStep } ) {
    return (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            {[
                { id: 1, label: "Thông tin cơ bản" },
                { id: 2, label: "Nội dung & Giá" },
                { id: 3, label: "Cài đặt" },
            ].map((s) => (
                <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`px-3 py-1.5 rounded-full border ${step === s.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    {s.id}. {s.label}
                </button>
            ))}
            <span className="ml-auto inline-flex items-center gap-2">
                <Link
                    to="/i/courses"
                    className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>
            </span>
        </div>
    )
}

export default WizardHeader;