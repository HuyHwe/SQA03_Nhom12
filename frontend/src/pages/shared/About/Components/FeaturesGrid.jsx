// src/pages/shared/About/Components/FeaturesGrid.jsx
import { CheckCircle } from "lucide-react";

const FEATURES = [
    { title: "Adaptive Learning", desc: "Tối ưu lộ trình luyện thi dựa trên năng lực hiện tại." },
    { title: "Spaced Repetition", desc: "Ôn tập flashcards khoa học để nhớ lâu hơn." },
    { title: "Mini-game Exercises", desc: "Bài tập dạng mini-game giúp học thú vị và bền bỉ." },
    { title: "AI Grading", desc: "Chấm/chữa phát âm & bài thi nói/viết bằng AI." },
    { title: "Detailed Statistics", desc: "Thống kê chi tiết theo ngày & theo dạng câu hỏi." },
    { title: "Personalized Roadmap", desc: "Lộ trình cá nhân hoá để chinh phục mục tiêu điểm." },
];

export default function FeaturesGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
                <div
                    key={f.title}
                    className="p-6 border rounded-2xl bg-white hover:shadow-md transition"
                >
                    <div className="h-10 w-10 grid place-items-center rounded-full bg-[#2563eb]/10 text-[#2563eb] mb-3">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">{f.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                </div>
            ))}
        </div>
    );
}
