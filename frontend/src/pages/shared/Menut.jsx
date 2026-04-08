"use client";

import { Link } from "react-router-dom";

const COMMON_MENU = [
  { label: "🏠 Trang chủ", path: "/" },
  { label: "🧭 Khám phá lộ trình/lịch học", path: "/discover" },
  { label: "📘 Danh sách khóa học", path: "/courses" },
  { label: "📗 Chi tiết khóa học", path: "/courses/1" },
  { label: "🧠 Thư viện đề thi", path: "/exam" },
  { label: "🧠 Giới thiệu đề thi", path: "/exam/1" },
  { label: "🔑 Login", path: "/login" },
  { label: "🆕 Register", path: "/register" },
  { label: "📰 Blog", path: "/blog" },
  { label: "🧩 Blog chi tiết", path: "/blog/1" },
  { label: "ℹ️ About", path: "/about" },
  { label: "💎 Membership", path: "/membership" },
  { label: "💳 Payment (mock)", path: "/payment" },
  { label: "🧭 Page Test Menu (nội bộ)", path: "/test" },
];

const STUDENT_MENU = [
  { label: "📊 Tổng quan học tập", path: "/s/dashboard" },
  { label: "📚 Khóa học của tôi", path: "/s/enrollments" },
  { label: "▶️ Học khoá (learning view)", path: "/s/learning/1" },
  { label: "📈 Lịch học", path: "/s/schedulepage" },
  { label: "📖 Chi tiết bài học", path: "/s/lesson/1" },
  { label: "🧾 Lịch sử làm đề thi", path: "/s/historytest" },
  { label: "🧠 Giới thiệu đề thi", path: "/s/exam/1" },
  { label: "🧪 Làm bài thi (attempt)", path: "/s/exam/1/take/1001" },
  { label: "📈 Kết quả 1 bài thi", path: "/s/results/1001" },
  { label: "📊 Tổng hợp kết quả", path: "/s/resultstest" },
  { label: "👤 Hồ sơ & cài đặt", path: "/s/profile" },
];

const INSTRUCTOR_MENU = [
  { label: "📊 Dashboard giảng viên", path: "/i/dashboard" },
  { label: "📚 Khóa học đã tạo", path: "/i/courses" },
  { label: "🆕 Tạo khóa học", path: "/i/courses/new" },
  { label: "✏️ Sửa khóa học (draft)", path: "/i/courses/1/edit" },
  { label: "🧱 Bài học của khóa", path: "/i/courses/1/lessons" },
  { label: "👥 Học viên & tiến độ", path: "/i/courses/1/students" },
  { label: "👤 Chi tiết tiến độ học viên", path: "/i/courses/1/students/42" },
  { label: "⭐ Quản lý đánh giá", path: "/i/courses/1/reviews" },
  { label: "🧠 Đề thi do tôi tạo", path: "/i/exams" },
  { label: "🆕 Tạo đề thi", path: "/i/exams/new" },
  { label: "✏️ Sửa đề thi (draft)", path: "/i/exams/1/edit" },
  { label: "📈 Thống kê đề thi", path: "/i/exams/1/stats" },
  { label: "🧾 Lượt làm & chi tiết", path: "/i/exams/1/attempts" },
];

function MenuCard({ title, subtitle, items, accent = "blue" }) {
  const accentMap = {
    blue: "from-blue-50 to-blue-100 border-blue-100",
    emerald: "from-emerald-50 to-emerald-100 border-emerald-100",
    violet: "from-violet-50 to-violet-100 border-violet-100",
  };

  const accentCls = accentMap[accent] || accentMap.blue;

  return (
    <div className={`w-full bg-white rounded-2xl shadow-xl border ${accentCls} p-6`}>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-auto pr-1">
        {items.map((p) => (
          <Link
            key={p.path}
            to={p.path}
            className="flex items-center justify-between px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-800 hover:text-white transition shadow-sm"
          >
            <span className="font-medium">{p.label}</span>
            <span className="text-xs opacity-70">{p.path}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Menut() {
  return (
    <section className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center py-10">
      <div className="w-full h-full px-10 space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            🔍 E-Learning PTIT — Page Test Menu (Routing Sandbox)
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Dùng trang này để kiểm tra routing, phân quyền UI theo role và layout toàn hệ thống.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <MenuCard
            title="Dùng chung (Public & Both)"
            subtitle="Các trang public & dùng chung cho cả học sinh/giảng viên"
            items={COMMON_MENU}
            accent="blue"
          />
          <MenuCard
            title="Học sinh (Student) — /s/*"
            subtitle="Khu vực học viên: học, xem kết quả, quản lý ghi danh"
            items={STUDENT_MENU}
            accent="emerald"
          />
          <MenuCard
            title="Giảng viên (Instructor) — /i/*"
            subtitle="Khu vực giảng viên: xây khoá học, đề thi, thống kê"
            items={INSTRUCTOR_MENU}
            accent="violet"
          />
        </div>

        <p className="text-sm text-center text-slate-500">
          Tip: Bạn có thể ẩn/hiện từng menu theo role đã đăng nhập. Phân quyền thực tế cần kiểm tra ở backend.
        </p>
      </div>
    </section>
  );
}
