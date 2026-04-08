// src/pages/shared/Home/components/FeaturesSection.jsx
import { Rocket, Brain, ChartLine, PlayCircle } from "lucide-react";
import { BORDER } from "../utils/constants";

const features = [
    { icon: <Rocket className="w-5 h-5" />, title: "Lộ trình rõ", desc: "Học theo mục tiêu, bám sát kỳ thi thật." },
    { icon: <Brain className="w-5 h-5" />, title: "Bài giảng cô đọng", desc: "Đi thẳng vào trọng tâm, dễ ghi nhớ." },
    { icon: <ChartLine className="w-5 h-5" />, title: "Theo dõi tiến độ", desc: "Dashboard & gợi ý ôn mục tiêu." },
    { icon: <PlayCircle className="w-5 h-5" />, title: "Luyện đề có giải", desc: "Chấm tự động & phân tích kết quả." },
];

export default function FeaturesSection() {
    return (
        <section className="w-full px-6 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {features.map((f, i) => (
                    <div key={i} className="bg-white border rounded-2xl p-5" style={{ borderColor: BORDER }}>
                        <div className="w-10 h-10 grid place-items-center rounded-lg bg-[#eef3ff] text-[#1b3ea9]">
                            {f.icon}
                        </div>
                        <h4 className="mt-3 font-semibold text-[#1a1a1a]">{f.title}</h4>
                        <p className="text-sm text-[#677788] mt-1">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
