// src/pages/shared/About/Components/IntroSection.jsx
import { CheckCircle } from "lucide-react";

export default function IntroSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="rounded-2xl border bg-white p-6">
                <h3 className="font-semibold text-lg text-slate-900">Mục tiêu & phạm vi</h3>
                <p className="mt-2 text-slate-700">
                    Các phần mềm của STUDY4 được xây dựng theo lộ trình từ cơ bản đến nâng cao, có ngân hàng bài tập đa dạng
                    và giao diện thân thiện cho người học Việt.
                </p>
                <ul className="mt-4 space-y-2 text-slate-700">
                    {[
                        "Sát đề & cập nhật thường xuyên.",
                        "Luyện đủ 4 kỹ năng và dạng câu hỏi trọng tâm.",
                        "Bài tập tăng dần độ khó kèm gợi ý/giải thích."
                    ].map((t) => (
                        <li key={t} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-[#2563eb]" />
                            <span>{t}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-2xl border bg-white p-6">
                <h3 className="font-semibold text-lg text-slate-900">Công nghệ học tập tiên tiến</h3>
                <p className="mt-2 text-slate-700">
                    STUDY4 áp dụng <b>adaptive learning</b>, <b>spaced-repetition</b>, bài tập dạng mini-game và <b>AI Grading</b>
                    cho phát âm, nói/viết. Toàn bộ quá trình học được thống kê chi tiết theo ngày và theo từng dạng câu hỏi
                    để người học theo dõi tiến độ và điều chỉnh phù hợp.
                </p>
            </div>
        </div>
    );
}
