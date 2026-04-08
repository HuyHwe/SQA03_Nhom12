// src/pages/shared/About/Components/AboutHero.jsx
export default function AboutHero() {
    return (
        <section className="w-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-white pt-10 lg:pt-14 pb-12">
            <div className="w-screen px-6 lg:px-12">
                <div className="max-w-4xl">
                    <div className="text-xs inline-flex border rounded-full px-3 py-1 text-[#2563eb] border-[#2563eb]">
                        STUDY4 • Về chúng tôi
                    </div>
                    <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">
                        Về chúng tôi
                    </h1>
                    <p className="mt-4 text-lg text-slate-700">
                        Công ty TNHH Công Nghệ A PLUS — đơn vị chủ quản website <span className="font-medium">study4.com</span> —
                        chuyên phát triển & cung cấp phần mềm luyện thi <b>IELTS, TOEIC, HSK</b> online chất lượng cao.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button className="rounded-full bg-[#2563eb] text-white px-5 py-3 hover:bg-[#1d4ed8] transition">
                            Khám phá chương trình học
                        </button>
                        <a href="#contact" className="rounded-full border px-5 py-3 text-slate-700 hover:bg-slate-50 transition">
                            Liên hệ nhanh
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
