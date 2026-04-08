// src/pages/shared/Home/components/NewsletterSection.jsx
import { Wand2 } from "lucide-react";
import { PRIMARY, PRIMARY_HOVER, BORDER } from "../utils/constants";

export default function NewsletterSection() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Đã đăng ký! 🎉");
    };

    return (
        <section className="w-full px-6 lg:px-12">
            <div className="bg-white border rounded-2xl p-6 lg:p-8" style={{ borderColor: BORDER }}>
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef3ff] text-[#1b3ea9] text-sm font-semibold">
                            <Wand2 className="w-4 h-4" /> Nhận tips học mỗi tuần
                        </div>
                        <h3 className="mt-3 text-xl lg:text-2xl font-extrabold text-[#1a1a1a]">
                            Đăng ký nhận bản tin
                        </h3>
                        <p className="text-[#677788] mt-1">
                            Cập nhật bài viết hay, đề mới & ưu đãi dành riêng cho bạn.
                        </p>
                    </div>
                    <form className="flex gap-2" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            required
                            placeholder="Nhập email của bạn"
                            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none"
                            style={{ borderColor: BORDER }}
                        />
                        <button
                            className="rounded-lg text-white px-5 py-3 font-semibold transition"
                            style={{ backgroundColor: PRIMARY }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                        >
                            Đăng ký
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
