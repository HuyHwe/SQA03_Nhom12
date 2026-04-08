import { Link } from "react-router-dom";
import { ArrowLeft, Download, Save, Rocket } from "lucide-react";

function Hero( { saveDraft, publish, exportJSON } ) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* <Link 
                        to="/i/exams"
                        className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đề
                    </Link> */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Tạo đề thi </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportJSON} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export JSON
                    </button>
                    <button onClick={saveDraft} className="rounded-xl bg-slate-900 hover:opacity-95 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                        <Save className="w-4 h-4" /> Lưu nháp
                    </button>
                    <button onClick={publish} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                        <Rocket className="w-4 h-4" /> Publish
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Hero;