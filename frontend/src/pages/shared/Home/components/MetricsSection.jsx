// src/pages/shared/Home/components/MetricsSection.jsx
import { BORDER } from "../utils/constants";

const stats = [
    { label: "Học viên", value: "12,500+" },
    { label: "Bài học", value: "1,200+" },
    { label: "Đề thi/Quiz", value: "350+" },
    { label: "Tỉ lệ hài lòng", value: "97%" },
];

export default function MetricsSection() {
    return (
        <section className="w-full px-6 lg:px-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white border rounded-xl p-5 text-center" style={{ borderColor: BORDER }}>
                        <p className="text-2xl font-extrabold text-[#1a1a1a]">{s.value}</p>
                        <p className="text-xs text-[#677788] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
