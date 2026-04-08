// src/pages/shared/Home/components/TestimonialSection.jsx
import { Trophy, CheckCircle2 } from "lucide-react";
import { BORDER } from "../utils/constants";

const highlights = [
    "Nội dung cô đọng, dễ theo sát",
    "Thống kê rõ điểm yếu để ôn lại",
    "Đề mô phỏng giống thi thật",
    "Giảng viên phản hồi nhanh",
];

export default function TestimonialSection() {
    return (
        <section className="w-full px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                <div className="bg-white border rounded-2xl p-6" style={{ borderColor: BORDER }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-[#1b3ea9]" />
                        <h4 className="font-semibold text-[#1a1a1a]">Học viên nói gì?</h4>
                    </div>
                    <p className="text-[#677788]">
                        "Nhờ lộ trình gợi ý + phần luyện đề có giải chi tiết, mình tăng từ 550 TOEIC lên 785 sau 2 tháng.
                        Dashboard theo dõi tiến độ cực rõ ràng!" — <b>Anh Khoa</b>
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {highlights.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[#1a1a1a]">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> {t}
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: BORDER }}>
                    <img src="/images/study-banner.jpg" alt="Study Banner" className="w-full h-40 object-cover" />
                </div> */}
            </div>
        </section>
    );
}
