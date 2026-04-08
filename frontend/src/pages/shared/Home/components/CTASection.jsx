// src/pages/shared/Home/components/CTASection.jsx
import { Link } from "react-router-dom";
import { PRIMARY, PRIMARY_HOVER, BORDER } from "../utils/constants";

export default function CTASection() {
    return (
        <section className="w-full px-6 lg:px-12 pb-12">
            <div className="bg-white border rounded-2xl p-6 lg:p-8 text-center" style={{ borderColor: BORDER }}>
                <h3 className="text-xl lg:text-2xl font-extrabold text-[#1a1a1a]">
                    Sẵn sàng bắt đầu hành trình mới?
                </h3>
                <p className="text-[#677788] mt-2">
                    Chọn khoá học phù hợp, luyện đề đều đặn và theo dõi tiến bộ mỗi ngày.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 rounded-lg text-white px-5 py-3 font-semibold transition"
                        style={{ backgroundColor: PRIMARY }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                    >
                        Khám phá khoá học
                    </Link>
                    {/* <Link
                        to="/exam"
                        className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold border"
                        style={{ borderColor: BORDER, color: "#1a1a1a" }}
                    >
                        Tới thư viện đề
                    </Link> */}
                </div>
            </div>
        </section>
    );
}
