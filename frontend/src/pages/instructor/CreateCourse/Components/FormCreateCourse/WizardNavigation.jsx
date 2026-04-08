import { ArrowLeft, ArrowRight, Save, Rocket } from "lucide-react";

function WizardNavigation( { 
    step, 
    prev, 
    next, 
} ) {
    return (
        <div className="flex items-center justify-between">
            <button
                onClick={prev}
                disabled={step === 1}
                className={`rounded-lg bg-transparent border px-4 py-2 text-sm inline-flex items-center gap-2 ${step === 1
                    ? "text-gray-400 border-gray-200"
                    : "hover:bg-gray-50"
                    }`}
            >
                <ArrowLeft className="w-4 h-4" /> Trước
            </button>

            <div className="flex gap-2">
                <button
                    onClick={next}
                    disabled={step === 3}
                    className={`rounded-lg border px-4 py-2 text-sm inline-flex items-center gap-2 bg-transparent ${step === 3
                    ? "text-gray-400 border-gray-200"
                    : "hover:bg-gray-50"
                    }`}
                >
                    Tiếp <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export default WizardNavigation;