// src/pages/shared/Home/components/HeroSection.jsx
import { BadgeCheck, Shield, Stars } from "lucide-react";
import { PRIMARY, PRIMARY_HOVER, BORDER } from "../utils/constants";

export default function HeroSection({ query, setQuery, onSearch }) {
    return (
        <section className="relative w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
            <div className="relative w-full px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
                <div>
                    <p className="text-xs uppercase tracking-wider text-[#35509a] font-semibold mb-2">
                        PTIT E-Learning
                    </p>
                    <h1 className="text-[30px] leading-[1.2] lg:text-[44px] font-extrabold text-[#1a1a1a]">
                        Học thông minh – Luyện đề hiệu quả – Theo dõi tiến độ
                    </h1>
                    <p className="mt-4 text-[#677788] max-w-2xl">
                        
                    </p>

                    {/* Search */}
                    <div className="mt-6 flex gap-2">
                        <input
                            type="text"
                            placeholder="Tìm khóa học,..."
                            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none"
                            style={{ borderColor: BORDER }}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
                        />
                        <button
                            className="rounded-lg text-white px-5 py-3 font-semibold transition"
                            style={{ backgroundColor: PRIMARY }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                            onClick={onSearch}
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    {/* Stats badges */}
                    {/* <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#677788]">
                        <span className="inline-flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4 text-green-600" /> Nội dung cập nhật hàng tuần
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Shield className="w-4 h-4 text-green-600" /> Hệ thống ổn định
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Stars className="w-4 h-4 text-yellow-600" /> 97% học viên hài lòng
                        </span>
                    </div> */}
                </div>

                {/* Visual */}
                {/* <div className="rounded-2xl overflow-hidden border shadow-sm">
                    <img
                        src="/hero-ielts.jpg"
                        alt="Elearning Hero"
                        className="w-full h-[280px] lg:h-[360px] object-cover"
                    />
                </div> */}
            </div>
        </section>
    );
}
