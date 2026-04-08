


// src/pages/Membership.jsx
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/* ========== Helpers: full-bleed (edge-to-edge) ========== */
const Section = ({ id, title, subtitle, action, children, className = "" }) => (
  <section id={id} className={`w-screen overflow-x-hidden py-12 lg:py-16 ${className}`}>
    <div className="w-screen px-6 lg:px-12">
      {(title || subtitle || action) && (
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">{title}</h2>}
            {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  </section>
);

const Primary = ({ children, className = "", ...props }) => (
  <button
    className={
      "rounded-full bg-[#2563eb] text-white px-5 py-3 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

const Ghost = ({ children, className = "", ...props }) => (
  <button
    className={
      "rounded-full border border-[#2563eb] text-[#2563eb] px-5 py-3 hover:bg-[#2563eb]/10 focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

/* ========== Pricing ========== */
function PriceCard({
  title,
  subtitle,
  price,          // số (VND) hoặc null => Miễn phí
  unit,           // "/tháng", "/người dùng", ...
  features = [],
  cta = "Chọn gói này",
  highlighted = false,
  note,
  badge,
}) {
  const fmtVND = (v) => (typeof v === "number" ? v.toLocaleString("vi-VN") + " đ" : v);

  return (
    <div
      className={
        "relative rounded-2xl border bg-white p-6 flex flex-col h-full " +
        (highlighted ? "shadow-xl ring-2 ring-[#2563eb]" : "hover:shadow-sm transition")
      }
    >
      {badge && (
        <span className="absolute -top-3 right-4 text-xs rounded-full bg-[#2563eb] text-white px-3 py-1 shadow">
          {badge}
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-slate-600">{subtitle}</p>}
      </div>

      <div className="mb-6">
        {price ? (
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-extrabold">{fmtVND(price)}</div>
            {unit && <div className="text-slate-600">{unit}</div>}
          </div>
        ) : (
          <div className="text-3xl font-extrabold text-slate-900">Miễn phí</div>
        )}
        {note && <div className="text-sm text-slate-500 mt-1">{note}</div>}
      </div>

      <ul className="space-y-2 text-sm text-slate-700 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="mt-0.5" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {highlighted ? (
          <Primary className="w-full">{cta}</Primary>
        ) : (
          <Ghost className="w-full">{cta}</Ghost>
        )}
      </div>
    </div>
  );
}

function Pricing() {
  const chung = [
    "Thư viện bài tập & đề thi cập nhật",
    "Flashcards + Spaced Repetition",
    "Theo dõi tiến độ & thống kê chi tiết",
    "Hỗ trợ kỹ thuật trong giờ hành chính",
  ];

  return (
    <Section
      id="pricing"
      title="Bảng giá thành viên"
      subtitle="Chọn gói phù hợp mục tiêu của bạn — có thể nâng cấp/hạ cấp bất kỳ lúc nào."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <PriceCard
          title="Cơ bản"
          subtitle="Bắt đầu miễn phí"
          price={null}
          features={[
            ...chung.slice(0, 2),
            "Giới hạn một số tính năng nâng cao",
          ]}
          cta="Dùng thử miễn phí"
          note="Không cần thẻ thanh toán"
        />

        <PriceCard
          title="Cá nhân"
          subtitle="Cho người học tự do"
          price={149000}
          unit="/tháng"
          features={[
            ...chung,
            "AI chấm phát âm & chữa bài nói/viết (giới hạn lượt)",
            "Lộ trình luyện thi cá nhân hoá",
          ]}
          cta="Bắt đầu học"
          note="Tiết kiệm khi đóng theo năm"
        />

        <PriceCard
          title="Doanh nghiệp/Trung tâm"
          subtitle="Tổ chức & nhóm học viên"
          price={99000}
          unit="/người dùng /tháng"
          features={[
            ...chung,
            "Quản trị lớp học, điểm danh & báo cáo",
            "AI chấm bài không giới hạn theo gói",
            "Hỗ trợ triển khai & đào tạo",
          ]}
          cta="Liên hệ tư vấn"
          highlighted
          badge="Phổ biến"
          note="Tối thiểu 10 người dùng"
        />
      </div>
    </Section>
  );
}

/* ========== FAQ ========== */
function FAQ() {
  const data = [
    { q: "Tôi có thể hủy gia hạn bất kỳ lúc nào không?", a: "Có. Bạn có thể hủy trước ngày gia hạn tiếp theo; quyền truy cập còn lại đến hết chu kỳ đã thanh toán." },
    { q: "Gói Cá nhân khác gì gói Cơ bản?", a: "Gói Cá nhân mở khóa AI Grading, lộ trình cá nhân hoá, thống kê nâng cao và nhiều đề thi hơn." },
    { q: "Trung tâm có bill/hoá đơn đỏ không?", a: "Có. Vui lòng để lại thông tin công ty, bộ phận kế toán của chúng tôi sẽ hỗ trợ xuất hoá đơn." },
    { q: "Có giảm giá theo năm?", a: "Có. Thanh toán theo năm sẽ được ưu đãi tốt hơn so với theo tháng." },
  ];
  const [open, setOpen] = useState(0);

  return (
    <Section id="faq" title="Câu hỏi thường gặp">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Học online hiệu quả cho người Việt</h3>
          <p className="text-slate-600 mt-2">
            Lộ trình từ cơ bản tới nâng cao, bài tập đa dạng, giao diện tiếng Việt thân thiện. Kết hợp AI để chấm điểm và góp ý tức thì.
          </p>
          <Primary className="mt-4">Bắt đầu học ngay</Primary>
        </div>

        <div className="rounded-2xl border divide-y bg-white">
          {data.map((item, i) => {
            const active = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(active ? -1 : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                  aria-expanded={active}
                >
                  <span className="font-medium text-slate-900">{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={active ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
                {active && <div className="px-5 pb-4 text-slate-600">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ========== Testimonials (carousel) ========== */
function Testimonials() {
  const list = useMemo(
    () =>
      [
        { id: 1, name: "Hải Đăng • IELTS 7.0", text: "AI chấm phát âm cực có ích. 2 tháng từ 6.0 lên 7.0 Speaking." },
        { id: 2, name: "Minh Anh • TOEIC 850", text: "Flashcards + Spaced-Repetition giúp mình nhớ từ siêu lâu." },
        { id: 3, name: "Trung Kiên • HSK 5", text: "Bài tập dạng mini-game khiến việc ôn luyện đỡ nhàm chán." },
        { id: 4, name: "Thu Hà • Giáo viên", text: "Bảng điều khiển lớp học & báo cáo rất tiện cho theo dõi tiến độ." },
      ],
    []
  );
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });

  return (
    <Section
      id="testimonials"
      title="Người học nói gì về chúng tôi"
      action={
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="rounded-full border px-3 py-2 hover:bg-slate-50" aria-label="Trượt trái">‹</button>
          <button onClick={() => scroll("right")} className="rounded-full border px-3 py-2 hover:bg-slate-50" aria-label="Trượt phải">›</button>
        </div>
      }
    >
      <div ref={ref} className="flex gap-6 overflow-x-auto no-scrollbar pr-2">
        {list.map((t) => (
          <div key={t.id} className="min-w-[300px] max-w-[300px] rounded-2xl border bg-white p-5">
            <div className="font-semibold text-slate-900">{t.name}</div>
            <p className="text-slate-600 text-sm mt-2">{t.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ========== Apps badges ========== */
function Apps() {
  return (
    <Section id="apps" title="Ứng dụng di động" subtitle="Có mặt trên Android & iOS">
      <div className="flex flex-wrap items-center gap-4">
        <a href="#" className="inline-flex items-center gap-3 rounded-xl border px-4 py-3 bg-white hover:shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.6 9H6.4A1.4 1.4 0 0 0 5 10.4v6.2A1.4 1.4 0 0 0 6.4 18h11.2a1.4 1.4 0 0 0 1.4-1.4v-6.2A1.4 1.4 0 0 0 17.6 9Z" /><path d="M8 9V7M16 9V7M9 6l-1-2M15 6l1-2" /></svg>
          <div className="leading-tight">
            <div className="text-xs text-slate-500">Android</div>
            <div className="font-medium">Tải miễn phí</div>
          </div>
        </a>
        <a href="#" className="inline-flex items-center gap-3 rounded-xl border px-4 py-3 bg-white hover:shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 13c0 4-3 8-6 8s-5-3-5-7 3-8 6-8 5 3 5 7Z" /><path d="M20 8c-1 1-2 1-3 1 0-1 1-3 3-3" /></svg>
          <div className="leading-tight">
            <div className="text-xs text-slate-500">iOS</div>
            <div className="font-medium">Tải miễn phí</div>
          </div>
        </a>
      </div>
    </Section>
  );
}

/* ========== Dual CTA ========== */
function DualCTA() {
  const Card = ({ title, text, btn }) => (
    <div className="rounded-2xl border p-6 bg-white flex flex-col">
      <div className="aspect-[16/9] rounded-xl bg-slate-100 grid place-items-center">
        <span className="text-xs text-slate-400">Ảnh minh hoạ</span>
      </div>
      <h3 className="mt-4 font-semibold text-lg text-slate-900">{title}</h3>
      <p className="text-slate-600 mt-2 flex-1">{text}</p>
      <Primary className="mt-4 self-start">{btn}</Primary>
    </div>
  );

  return (
    <Section id="cta">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Trở thành giảng viên"
          text="Đăng khóa học, quản lý lớp học và theo dõi tiến độ học viên với bảng điều khiển chuyên nghiệp."
          btn="Ứng tuyển giảng viên"
        />
        <Card
          title="Trở thành cộng tác viên nội dung"
          text="Cùng xây dựng ngân hàng bài tập, đề thi và tài liệu chất lượng cho cộng đồng người học."
          btn="Đăng ký cộng tác"
        />
      </div>
    </Section>
  );
}

/* ========== Page ========== */
export default function Membership() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="w-screen overflow-x-hidden pt-10">
        <div className="w-screen px-6 lg:px-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900">Thành viên & Bảng giá</h1>
            <p className="text-slate-600 mt-2">Chọn gói phù hợp và bắt đầu hành trình chinh phục mục tiêu.</p>
          </div>
          <Link to="/register" className="text-[#2563eb] hover:underline">Đăng ký ngay</Link>
        </div>
        <div className="mt-6 w-screen">
          <div className="mx-6 lg:mx-12 rounded-2xl h-48 bg-gradient-to-tr from-blue-50 via-indigo-50 to-sky-100 grid place-items-center">
            <span className="text-sm text-blue-500">Hình hero (thay sau)</span>
          </div>
        </div>
      </section>

      <Pricing />
      <FAQ />
      <Testimonials />
      <Apps />
      <DualCTA />

      <Footer />
    </>
  );
}
