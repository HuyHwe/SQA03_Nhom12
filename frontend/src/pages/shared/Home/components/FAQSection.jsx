// src/pages/shared/Home/components/FAQSection.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PRIMARY, BORDER, faqsDefault } from "../utils/constants";

export default function FAQSection() {
    const [faqs, setFaqs] = useState(() => faqsDefault.map((f, i) => ({ ...f, open: i === 0 })));

    const toggleFAQ = (idx) => {
        setFaqs((s) => s.map((x, i) => (i === idx ? { ...x, open: !x.open } : x)));
    };

    return (
        <section className="w-full px-6 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
                <div className="bg-white border rounded-2xl p-6" style={{ borderColor: BORDER }}>
                    <h3 className="text-xl font-extrabold text-[#1a1a1a]">Câu hỏi thường gặp</h3>
                    <p className="text-sm text-[#677788] mt-1">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình học. Nếu chưa thấy câu trả lời, hãy liên hệ.
                    </p>
                    <Link
                        to="/support"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                        style={{ color: PRIMARY }}
                    >
                        Trung tâm hỗ trợ <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white border rounded-2xl p-2" style={{ borderColor: BORDER }}>
                    {faqs.map((f, idx) => (
                        <div key={idx} className="border-b last:border-none" style={{ borderColor: BORDER }}>
                            <button
                                className="w-full flex items-center justify-between text-left px-4 py-4"
                                onClick={() => toggleFAQ(idx)}
                                type="button"
                            >
                                <span className="font-medium text-[#1a1a1a]">{f.q}</span>
                                <ChevronDown className={`w-5 h-5 transition ${f.open ? "rotate-180" : ""}`} />
                            </button>
                            {f.open && (
                                <div className="px-4 pb-4 text-sm text-[#677788]">{f.a}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
