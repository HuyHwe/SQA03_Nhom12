// src/pages/Dashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/* ================= helpers ================= */
const Section = ({ id, title, subtitle, action, children, className = "" }) => (
  <section id={id} className={`w-screen overflow-x-hidden py-8 lg:py-12 ${className}`}>
    <div className="w-screen px-6 lg:px-12">
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">{title}</h2>}
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
    type="button"
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
    type="button"
    className={
      "rounded-full border border-[#2563eb] text-[#2563eb] px-5 py-3 hover:bg-[#2563eb]/10 focus:outline-none focus:ring-2 focus:ring-[#93c5fd] transition " +
      className
    }
    {...props}
  >
    {children}
  </button>
);

/* ================= mock data ================= */
const HISTORY = [
  { id: "h1", title: "React 19 & Server Actions", teacher: "Luân", progress: "Bài 5 / 7" },
  { id: "h2", title: "JavaScript hiện đại: Async/Await", teacher: "Điệp", progress: "Bài 2 / 6" },
  { id: "h3", title: "Thiết kế UX/UI cơ bản", teacher: "Mạnh", progress: "Bài 1 / 9" },
];

const MY_COURSES = [
  { id: "c1", title: "React 19 & Server Actions", teacher: "Luân", tag: "Lập trình Web", duration: "3 tháng", progress: 68 },
  { id: "c2", title: "Lập trình Python căn bản", teacher: "Hương", tag: "Lập trình", duration: "2 tháng", progress: 35 },
  { id: "c3", title: "Thiết kế UX/UI cho người mới", teacher: "Mạnh", tag: "UX/UI", duration: "1.5 tháng", progress: 82 },
  { id: "c4", title: "Cấu trúc dữ liệu & Giải thuật", teacher: "Điệp", tag: "Khoa học máy tính", duration: "3 tháng", progress: 12 },
];

const SCHEDULE = [
  { id: "s1", date: "Th 3, 10/10", time: "08:30", title: "React 19 — Server Actions", room: "Zoom #847-233", teacher: "Luân" },
  { id: "s2", date: "Th 4, 11/10", time: "09:00", title: "Python căn bản — Vòng lặp", room: "Zoom #992-341", teacher: "Hương" },
  { id: "s3", date: "Th 6, 13/10", time: "13:30", title: "UX/UI — Wireframe", room: "Zoom #661-022", teacher: "Mạnh" },
];

const ANNOUNCEMENTS = [
  { id: "a1", title: "Bảo trì Zoom 22:00–24:00 tối nay", text: "Hệ thống bảo trì 2 tiếng để bổ sung tính năng mới.", tag: "Thông báo" },
  { id: "a2", title: "Mở khoá React mới", text: "Server Actions, RSC, Form Actions…", tag: "Mới" },
];

const TODOS_DEFAULT = [
  { id: "t1", text: "Hoàn thành bài tập React 19", done: false },
  { id: "t2", text: "Đọc chương 3 Python", done: true },
  { id: "t3", text: "Nộp quiz UX/UI", done: false },
];

const ACTIVITIES = [
  { id: "r1", text: "Bạn đã hoàn thành 2 bài học trong “React 19 & Server Actions”", time: "2 giờ trước" },
  { id: "r2", text: "Điệp đã phản hồi bài nộp của bạn trong “CTDL & GT”", time: "Hôm qua" },
  { id: "r3", text: "Bạn đã ghi danh khoá “UX/UI cho người mới”", time: "2 ngày trước" },
];

/* ================= small UI pieces ================= */
const Eye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const Clock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);

/* History horizontal card */
function HistoryCard({ item }) {
  return (
    <Link
      to="#"
      className="rounded-xl border bg-white p-4 min-w-[260px] hover:shadow-md transition"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-blue-50 grid place-items-center shrink-0 text-[#2563eb]">
          <Eye />
        </div>
        <div>
          <div className="font-medium leading-tight line-clamp-1 text-slate-900">{item.title}</div>
          <div className="text-xs text-slate-600">
            {item.teacher} • {item.progress}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Course card with progress */
function CourseCard({ c }) {
  return (
    <Link to={`/courses/${c.id}`} className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition">
      <div className="aspect-[16/9] bg-blue-50 grid place-items-center">
        <span className="text-xs text-blue-400">Ảnh khoá học</span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-[#2563eb] transition">{c.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{c.teacher} • {c.tag}</p>
        <div className="mt-2 text-xs text-slate-500 inline-flex items-center gap-2">
          <Clock /> {c.duration}
        </div>

        {/* progress */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-[#2563eb]" style={{ width: `${c.progress}%` }} />
          </div>
          <div className="mt-1 text-xs text-slate-600">{c.progress}% hoàn thành</div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Primary className="px-4 py-2 text-sm">Tiếp tục học</Primary>
          <Ghost className="px-4 py-2 text-sm">Chi tiết</Ghost>
        </div>
      </div>
    </Link>
  );
}

/* Schedule item */
function ScheduleItem({ s }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex items-center gap-4">
      <div className="text-center">
        <div className="text-xs text-slate-500">{s.date}</div>
        <div className="text-lg font-semibold text-slate-900">{s.time}</div>
      </div>
      <div className="h-10 w-px bg-slate-200" />
      <div className="flex-1">
        <div className="font-medium leading-tight text-slate-900">{s.title}</div>
        <div className="text-xs text-slate-500">{s.teacher} • {s.room}</div>
      </div>
      <Ghost className="px-4 py-2 text-sm">Tham gia</Ghost>
    </div>
  );
}

/* Announcement */
function Announcement({ a }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs inline-flex px-2 py-0.5 rounded-full border mr-2 text-[#2563eb] border-[#2563eb]/40">{a.tag}</div>
      <div className="font-medium mt-1 text-slate-900">{a.title}</div>
      <p className="text-sm text-slate-600 mt-1">{a.text}</p>
    </div>
  );
}

/* Todo list */
function Todos() {
  const [items, setItems] = useState(TODOS_DEFAULT);
  const toggle = (id) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const add = (e) => {
    e.preventDefault();
    const v = new FormData(e.currentTarget).get("todo");
    if (!v) return;
    setItems((xs) => [{ id: `t${Date.now()}`, text: String(v), done: false }, ...xs]);
    e.currentTarget.reset();
  };

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Việc cần làm</h3>
      </div>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input
          name="todo"
          placeholder="Thêm việc cần làm…"
          className="flex-1 rounded-full border px-4 py-2 outline-none focus:ring-2 focus:ring-[#93c5fd]"
        />
        <Primary className="px-4 py-2" type="submit">Thêm</Primary>
      </form>

      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-[#2563eb]"
              checked={t.done}
              onChange={() => toggle(t.id)}
            />
            <span className={`text-sm ${t.done ? "line-through text-slate-400" : "text-slate-800"}`}>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Activity feed */
function ActivityFeed() {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="font-semibold mb-3 text-slate-900">Hoạt động gần đây</h3>
      <ul className="space-y-3">
        {ACTIVITIES.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-[#2563eb]/10 grid place-items-center text-[#2563eb]">✓</div>
            <div>
              <div className="text-sm text-slate-800">{a.text}</div>
              <div className="text-xs text-slate-500">{a.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================= sections ================= */
function Welcome() {
  const ref = useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <section className="w-screen overflow-x-hidden pt-6">
      <div className="w-screen px-6 lg:px-12">
        {/* Top row: greeting + actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Xin chào 👋, chúc bạn học tốt hôm nay!</h1>
            <p className="text-slate-600 mt-1">Tiếp tục với khoá học gần nhất, hoặc khám phá nội dung mới.</p>
          </div>
          <div className="flex items-center gap-2">
            <Ghost className="px-4 py-2">Tạo lớp học</Ghost>
            <Primary className="px-4 py-2">Tham gia lớp học</Primary>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              placeholder="Tìm khoá học, bài giảng, tài liệu…"
              className="flex-1 rounded-full border px-5 py-3 outline-none focus:ring-2 focus:ring-[#93c5fd]"
            />
            <Primary className="px-5 py-3">Tìm</Primary>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Đã ghi danh", value: "12" },
            { label: "Đang học", value: "5" },
            { label: "Hoàn thành", value: "7" },
            { label: "Giờ học", value: "124h" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border bg-white p-5">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-2xl font-extrabold mt-1 text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Continue learning */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-lg font-semibold text-slate-900">Tiếp tục học</div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="rounded-full border px-3 py-2 hover:bg-slate-50" aria-label="Trượt trái">‹</button>
            <button onClick={() => scroll("right")} className="rounded-full border px-3 py-2 hover:bg-slate-50" aria-label="Trượt phải">›</button>
            <Link to="/courses" className="text-[#2563eb] ml-2 hover:underline">Xem tất cả</Link>
          </div>
        </div>

        <div ref={ref} className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {HISTORY.map((h) => <HistoryCard key={h.id} item={h} />)}
        </div>
      </div>
    </section>
  );
}

/* Khối "Khóa học của tôi" dùng trong lưới 2 cột — KHÔNG dùng w-screen để tránh vỡ layout */
function MyCoursesBlock() {
  return (
    <div className="py-8 lg:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1d4ed8]">Khóa học của tôi</h2>
        <Link to="/courses" className="text-[#2563eb] hover:underline">Xem tất cả</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {MY_COURSES.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

function RightColumn() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-semibold mb-3 text-slate-900">Lịch học sắp tới</h3>
        <div className="grid gap-3">
          {SCHEDULE.map((s) => <ScheduleItem key={s.id} s={s} />)}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h3 className="font-semibold mb-3 text-slate-900">Thông báo</h3>
        <div className="grid gap-3">
          {ANNOUNCEMENTS.map((a) => <Announcement key={a.id} a={a} />)}
        </div>
      </div>

      <Todos />
      <ActivityFeed />
    </div>
  );
}

/* ================= page ================= */
export default function Dashboard() {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <>
      <Header />
      {/* Welcome: full-width */}
      <Welcome />

      {/* Two-column main: MyCourses + right sidebar */}
      <section className="w-screen overflow-x-hidden">
        <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MyCoursesBlock />
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-20 h-fit">
            <RightColumn />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
