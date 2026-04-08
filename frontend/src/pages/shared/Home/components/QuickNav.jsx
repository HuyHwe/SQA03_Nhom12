// src/pages/shared/Home/components/QuickNav.jsx
import { Link } from "react-router-dom";
import { BookOpen, Library, Timer, PlayCircle } from "lucide-react";
import { BORDER } from "../utils/constants";

const categories = [
    { icon: <BookOpen className="w-5 h-5" />, label: "Khóa học", to: "/courses", desc: "Lộ trình rõ ràng" },
    // { icon: <Library className="w-5 h-5" />, label: "Thư viện đề thi", to: "/exam", desc: "Đáp án chi tiết" },
    // { icon: <Timer className="w-5 h-5" />, label: "Luyện tập nhanh", to: "/s/quick-practice", desc: "Quiz 5-10 phút" },
    // { icon: <PlayCircle className="w-5 h-5" />, label: "Gói thành viên", to: "/membership", desc: "Tiết kiệm 60%" },
];

export default function QuickNav() {
    return (
        <section className="w-full px-6 lg:px-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((c) => (
                    <Link
                        key={c.to}
                        to={c.to}
                        className="bg-white border rounded-xl p-4 hover:shadow-sm transition flex items-center gap-3"
                        style={{ borderColor: BORDER }}
                    >
                        <div className="w-10 h-10 grid place-items-center rounded-lg bg-[#eef3ff] text-[#1b3ea9]">
                            {c.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-[#1a1a1a]">{c.label}</p>
                            <p className="text-xs text-[#677788]">{c.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
