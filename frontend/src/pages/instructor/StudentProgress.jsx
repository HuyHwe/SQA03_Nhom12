// // src/pages/instructor/StudentProgress.jsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";
// import {
//   ArrowLeft, Mail, Ban, RotateCcw, Award, CalendarDays, Timer,
//   BarChart3, BookOpen, Target, Gauge, Download, ExternalLink, CheckCircle2, CircleDot
// } from "lucide-react";

// /* ===== Mock: thay bằng API thật khi backend sẵn sàng ===== */
// const MOCK_STUDENT = {
//   id: 42,
//   name: "Lê Minh",
//   email: "le.minh@example.com",
//   avatar: null,
//   enrolledAt: "2025-10-07",
//   lastActive: "2025-11-06",
//   status: "active", // active | paused | completed | refunded
//   progress: 76,     // %
//   lessonsDone: 32,
//   lessonsTotal: 42,
//   timeSpent: 14320, // minutes ~ 238h
//   avgScore: 71,     // %
//   attempts: 5,
//   certificate: false,
// };

// const MOCK_ATTEMPTS = [
//   { id: 1001, examTitle: "JS Cơ bản – 60 câu", date: "2025-11-02 20:14", duration: "48:12", scorePct: 68, status: "graded" },
//   { id: 1002, examTitle: "React Hooks – 40 câu", date: "2025-11-04 21:03", duration: "36:50", scorePct: 74, status: "graded" },
//   { id: 1005, examTitle: "Node REST – 50 câu",  date: "2025-11-06 19:22", duration: "42:17", scorePct: 71, status: "graded" },
// ];

// const MOCK_PROGRESS_SERIES = [35, 42, 50, 55, 60, 64, 67, 70, 72, 73, 74, 76]; // % theo tuần
// const MOCK_LESSON_TIMELINE = [
//   { id: 1, title: "Giới thiệu khoá học", type: "video", duration: "06:12", doneAt: "2025-10-07" },
//   { id: 2, title: "Cài đặt môi trường", type: "video", duration: "08:34", doneAt: "2025-10-07" },
//   { id: 3, title: "JS cơ bản: biến & scope", type: "reading", duration: "—", doneAt: "2025-10-09" },
//   { id: 4, title: "Async & Promise", type: "video", duration: "14:20", doneAt: "2025-10-12" },
//   { id: 5, title: "React: useState/useEffect", type: "video", duration: "18:03", doneAt: "2025-10-18" },
//   { id: 6, title: "React Router", type: "reading", duration: "—", doneAt: "2025-10-23" },
//   { id: 7, title: "Mini Project 1", type: "project", duration: "—", doneAt: "2025-10-29" },
//   { id: 8, title: "Hook nâng cao", type: "video", duration: "21:40", doneAt: null },
//   { id: 9, title: "State management & Context", type: "reading", duration: "—", doneAt: null },
// ];

// const STATUS_BADGE = {
//   active: "bg-emerald-100 text-emerald-700",
//   paused: "bg-amber-100 text-amber-700",
//   completed: "bg-indigo-100 text-indigo-700",
//   refunded: "bg-rose-100 text-rose-700",
// };

// export default function StudentProgress() {
//   const { id, userId } = useParams();
//   const [notes, setNotes] = useState([
//     { id: 1, at: "2025-11-03 09:12", text: "Nhắc hoàn thành bài 'React Router' trong tuần này." },
//     { id: 2, at: "2025-11-05 19:01", text: "Điểm ổn định ~70%. Gợi ý luyện thêm phần JS cơ bản." },
//   ]);
//   const [newNote, setNewNote] = useState("");

//   useEffect(() => window.scrollTo(0, 0), []);

//   const s = MOCK_STUDENT; // normally fetch by {id, userId}

//   const timeSpentFmt = useMemo(() => {
//     const h = Math.floor(s.timeSpent / 60);
//     const m = s.timeSpent % 60;
//     return `${h}h ${m}m`;
//   }, [s.timeSpent]);

//   const sparkPath = useMemo(() => {
//     // tạo sparkline path đơn giản trong viewBox 120x36
//     const W = 120, H = 36;
//     const max = 100, min = 0;
//     const step = W / (MOCK_PROGRESS_SERIES.length - 1);
//     const points = MOCK_PROGRESS_SERIES.map((v, i) => {
//       const x = i * step;
//       const y = H - (H * (v - min)) / (max - min);
//       return `${x},${y}`;
//     });
//     return `M ${points[0]} L ${points.slice(1).join(" ")}`;
//   }, []);

//   const exportAttemptsCSV = () => {
//     const rows = [
//       ["attemptId", "examTitle", "date", "duration", "scorePct", "status"],
//       ...MOCK_ATTEMPTS.map(a => [a.id, a.examTitle, a.date, a.duration, a.scorePct, a.status]),
//     ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `course_${id}_student_${userId}_attempts.csv`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   const addNote = () => {
//     if (!newNote.trim()) return;
//     setNotes(prev => [{ id: Date.now(), at: new Date().toISOString().slice(0,16).replace("T"," "), text: newNote.trim() }, ...prev]);
//     setNewNote("");
//   };

//   return (
//     <div className="min-h-screen w-screen max-w-none bg-white">
//       <Header />

//       {/* HERO */}
//       <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
//         <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Link to={`/i/courses/${id}/students`} className="rounded-lg border px-3 py-1.5 hover:bg-white/60 inline-flex items-center gap-2">
//               <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
//             </Link>
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 rounded-full bg-slate-900 text-white grid place-items-center text-sm font-bold">
//                 {s.name.slice(0,1)}
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Tiến độ học viên — {s.name}</h1>
//                 <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
//                   <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status]}`}>{s.status}</span>
//                   <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Ghi danh {s.enrolledAt}</span>
//                   <span className="inline-flex items-center gap-1"><Timer className="w-4 h-4" /> Hoạt động gần nhất {s.lastActive}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button onClick={exportAttemptsCSV} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white">
//               <Download className="w-4 h-4 inline mr-1" /> Export Attempts
//             </button>
//             <button onClick={() => alert("Nhắn tin (demo)")} className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2">
//               <Mail className="w-4 h-4" /> Nhắn tin
//             </button>
//             <button onClick={() => alert("Đặt lại tiến độ (demo)")} className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2">
//               <RotateCcw className="w-4 h-4" /> Reset tiến độ
//             </button>
//             <button onClick={() => alert("Thu hồi quyền (demo)")} className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2 text-rose-700 border-rose-200">
//               <Ban className="w-4 h-4" /> Thu hồi quyền
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* MAIN */}
//       <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-8">
//         {/* LEFT: KPIs + timeline + attempts */}
//         <section className="space-y-8">
//           {/* KPI cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <KPI icon={<Gauge className="w-4 h-4" />} label="Tiến độ" value={`${s.progress}%`}>
//               <Radial pct={s.progress} />
//             </KPI>
//             <KPI icon={<BookOpen className="w-4 h-4" />} label="Bài đã học" value={`${s.lessonsDone}/${s.lessonsTotal}`} />
//             <KPI icon={<BarChart3 className="w-4 h-4" />} label="Điểm TB" value={`${s.avgScore}%`}>
//               <Spark series={MOCK_PROGRESS_SERIES} path={sparkPath} />
//             </KPI>
//             <KPI icon={<Target className="w-4 h-4" />} label="Thời gian học" value={timeSpentFmt} />
//           </div>

//           {/* Timeline học bài */}
//           <div className="rounded-2xl border bg-white p-5">
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-900">Tiến độ theo bài học</h2>
//               {s.certificate ? (
//                 <span className="inline-flex items-center gap-1 text-sm text-indigo-700">
//                   <Award className="w-4 h-4" /> Đã cấp chứng chỉ
//                 </span>
//               ) : null}
//             </div>

//             <div className="mt-4">
//               <ul className="relative">
//                 {MOCK_LESSON_TIMELINE.map((l, idx) => (
//                   <li key={l.id} className="pl-8 pb-5 last:pb-0 relative">
//                     {/* line */}
//                     {idx < MOCK_LESSON_TIMELINE.length - 1 && (
//                       <span className="absolute left-[11px] top-4 bottom-[-8px] w-[2px] bg-gray-200" />
//                     )}
//                     {/* dot */}
//                     <span className={`absolute left-0 top-1.5 w-5 h-5 rounded-full grid place-items-center
//                       ${l.doneAt ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
//                       {l.doneAt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
//                     </span>

//                     <div className="flex items-start justify-between gap-3">
//                       <div>
//                         <div className="font-medium text-gray-900">{l.title}</div>
//                         <div className="text-xs text-gray-600">
//                           Loại: {l.type} {l.duration !== "—" ? `• ${l.duration}` : ""}
//                         </div>
//                       </div>
//                       <div className="text-xs text-gray-500">{l.doneAt ? `Hoàn thành ${l.doneAt}` : "Chưa hoàn thành"}</div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Attempts table */}
//           <div className="rounded-2xl border bg-white overflow-hidden">
//             <div className="px-5 py-4 border-b flex items-center justify-between">
//               <h2 className="text-lg font-bold text-gray-900">Lượt làm bài thi</h2>
//               <button onClick={exportAttemptsCSV} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
//                 <Download className="w-4 h-4" /> Export CSV
//               </button>
//             </div>

//             <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
//               <div className="col-span-5">Đề thi</div>
//               <div className="col-span-2">Thời gian</div>
//               <div className="col-span-2 text-center">Điểm</div>
//               <div className="col-span-1 text-center">Trạng thái</div>
//               <div className="col-span-2 text-right">Xem</div>
//             </div>

//             {MOCK_ATTEMPTS.map(a => (
//               <div key={a.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
//                 <div className="col-span-5">
//                   <div className="font-medium text-gray-900">{a.examTitle}</div>
//                   <div className="text-xs text-gray-600">{a.date} • {a.duration}</div>
//                 </div>
//                 <div className="col-span-2 text-sm text-gray-700">{a.date}</div>
//                 <div className="col-span-2 text-center">
//                   <span className={`text-sm font-semibold ${a.scorePct >= 70 ? "text-emerald-700" : "text-amber-700"}`}>{a.scorePct}%</span>
//                 </div>
//                 <div className="col-span-1 text-center text-xs">
//                   <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{a.status}</span>
//                 </div>
//                 <div className="col-span-2">
//                   <div className="flex items-center justify-end gap-2">
//                     {/* tuỳ routing thực tế của bạn */}
//                     <Link to={`/s/results/${a.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1">
//                       Chi tiết <ExternalLink className="w-4 h-4" />
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* RIGHT: Insights + Notes */}
//         <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
//           {/* Insight cards */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="rounded-xl border bg-white p-4">
//               <div className="text-xs text-gray-600 inline-flex items-center gap-2">
//                 <BarChart3 className="w-4 h-4" /> Xu hướng điểm
//               </div>
//               <div className="mt-2">
//                 <Spark series={MOCK_PROGRESS_SERIES} path={sparkPath} big />
//               </div>
//               <div className="mt-2 text-xs text-gray-600">
//                 Tăng từ {MOCK_PROGRESS_SERIES[0]}% → {MOCK_PROGRESS_SERIES.at(-1)}% trong 12 mốc.
//               </div>
//             </div>

//             <div className="rounded-xl border bg-white p-4">
//               <div className="text-xs text-gray-600 inline-flex items-center gap-2">
//                 <Target className="w-4 h-4" /> Gợi ý
//               </div>
//               <ul className="mt-2 text-sm text-gray-700 space-y-1">
//                 <li>• Hoàn thiện 2 bài còn lại (Hook nâng cao, Context).</li>
//                 <li>• Ôn tập lại phần Async/Promise để tăng điểm ổn định 75%+.</li>
//                 <li>• Làm thêm 1 attempt cho “Node REST – 50 câu”.</li>
//               </ul>
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="rounded-2xl border bg-white p-5">
//             <h3 className="text-sm font-bold text-gray-900 mb-3">Ghi chú nội bộ</h3>
//             <div className="flex gap-2">
//               <input
//                 value={newNote}
//                 onChange={(e) => setNewNote(e.target.value)}
//                 placeholder="Thêm ghi chú (chỉ giảng viên thấy)…"
//                 className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button onClick={addNote} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold">
//                 Lưu
//               </button>
//             </div>
//             <div className="mt-4 grid gap-3">
//               {notes.map(n => (
//                 <div key={n.id} className="rounded-lg border bg-gray-50 p-3">
//                   <div className="text-xs text-gray-500">{n.at}</div>
//                   <div className="text-sm text-gray-800">{n.text}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Quick Badges */}
//           <div className="rounded-2xl border bg-white p-5">
//             <h3 className="text-sm font-bold text-gray-900 mb-3">Thành tích</h3>
//             <div className="flex flex-wrap gap-2 text-xs">
//               <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 inline-flex items-center gap-1">
//                 <CheckCircle2 className="w-3 h-3" /> Hoàn 75%+
//               </span>
//               {s.avgScore >= 70 && (
//                 <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
//                   <Award className="w-3 h-3" /> Điểm TB 70%+
//                 </span>
//               )}
//             </div>
//           </div>
//         </aside>
//       </main>

//       <Footer />
//     </div>
//   );
// }

// /* ===== Small UI pieces ===== */
// function KPI({ icon, label, value, children }) {
//   return (
//     <div className="rounded-2xl border bg-white p-5">
//       <div className="text-xs text-gray-600 flex items-center gap-2">{icon}{label}</div>
//       <div className="mt-1 flex items-end justify-between">
//         <div className="text-2xl font-extrabold text-gray-900">{value}</div>
//         {children}
//       </div>
//     </div>
//   );
// }

// function Radial({ pct }) {
//   return (
//     <div
//       className="w-12 h-12 rounded-full grid place-items-center text-sm font-bold"
//       style={{
//         background: `conic-gradient(#2563eb ${pct * 3.6}deg, #e5e7eb 0)`,
//       }}
//       title={`${pct}%`}
//     >
//       <span className="bg-white w-8 h-8 rounded-full grid place-items-center shadow-inner">{pct}%</span>
//     </div>
//   );
// }

// function Spark({ series, path, big = false }) {
//   const W = big ? 160 : 120;
//   const H = big ? 48 : 36;
//   const last = series.at(-1);
//   const first = series[0];
//   const tone = last >= first ? "text-emerald-600" : "text-rose-600";
//   return (
//     <svg width={W} height={H} viewBox={`0 0 120 36`} className={`ml-3 ${tone}`}>
//       <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
//     </svg>
//   );
// }




















"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Mail, Ban, RotateCcw, Award, CalendarDays, Timer,
  BarChart3, BookOpen, Target, Gauge, Download, ExternalLink,
  CheckCircle2, CircleDot, Loader2
} from "lucide-react";

const API_BASE = "http://localhost:5102/api";

/* ================= Mock fallback ================= */
const MOCK_STUDENT = {
  id: 42,
  name: "Lê Minh",
  email: "le.minh@example.com",
  avatar: null,
  enrolledAt: "2025-10-07",
  lastActive: "2025-11-06",
  status: "active", // active | paused | completed | refunded
  progress: 76,
  lessonsDone: 32,
  lessonsTotal: 42,
  timeSpent: 14320,
  avgScore: 71,
  attempts: 5,
  certificate: false,
};

const MOCK_ATTEMPTS = [
  { id: 1001, examTitle: "JS Cơ bản – 60 câu", date: "2025-11-02 20:14", duration: "48:12", scorePct: 68, status: "graded" },
  { id: 1002, examTitle: "React Hooks – 40 câu", date: "2025-11-04 21:03", duration: "36:50", scorePct: 74, status: "graded" },
  { id: 1005, examTitle: "Node REST – 50 câu", date: "2025-11-06 19:22", duration: "42:17", scorePct: 71, status: "graded" },
];

const MOCK_PROGRESS_SERIES = [35, 42, 50, 55, 60, 64, 67, 70, 72, 73, 74, 76];
const MOCK_LESSON_TIMELINE = [
  { id: 1, title: "Giới thiệu khoá học", type: "video", duration: "06:12", doneAt: "2025-10-07" },
  { id: 2, title: "Cài đặt môi trường", type: "video", duration: "08:34", doneAt: "2025-10-07" },
  { id: 3, title: "JS cơ bản: biến & scope", type: "reading", duration: "—", doneAt: "2025-10-09" },
  { id: 4, title: "Async & Promise", type: "video", duration: "14:20", doneAt: "2025-10-12" },
  { id: 5, title: "React: useState/useEffect", type: "video", duration: "18:03", doneAt: "2025-10-18" },
  { id: 6, title: "React Router", type: "reading", duration: "—", doneAt: "2025-10-23" },
  { id: 7, title: "Mini Project 1", type: "project", duration: "—", doneAt: "2025-10-29" },
  { id: 8, title: "Hook nâng cao", type: "video", duration: "21:40", doneAt: null },
  { id: 9, title: "State management & Context", type: "reading", duration: "—", doneAt: null },
];

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  refunded: "bg-rose-100 text-rose-700",
};

export default function StudentProgress() {
  const { id, userId } = useParams();
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([
    { id: 1, at: "2025-11-03 09:12", text: "Nhắc hoàn thành bài 'React Router' trong tuần này." },
    { id: 2, at: "2025-11-05 19:01", text: "Điểm ổn định ~70%. Gợi ý luyện thêm phần JS cơ bản." },
  ]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE}/courses/${id}/students/${userId}/progress`);
        if (!res.ok) throw new Error("No API yet");
        const data = await res.json();
        setStudent(data.student);
        setAttempts(data.attempts);
        setTimeline(data.timeline);
      } catch {
        // fallback mock
        setStudent(MOCK_STUDENT);
        setAttempts(MOCK_ATTEMPTS);
        setTimeline(MOCK_LESSON_TIMELINE);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, userId]);

  const s = student || MOCK_STUDENT;

  const timeSpentFmt = useMemo(() => {
    const h = Math.floor(s.timeSpent / 60);
    const m = s.timeSpent % 60;
    return `${h}h ${m}m`;
  }, [s.timeSpent]);

  const sparkPath = useMemo(() => {
    const W = 120, H = 36;
    const max = 100, min = 0;
    const step = W / (MOCK_PROGRESS_SERIES.length - 1);
    const pts = MOCK_PROGRESS_SERIES.map((v, i) => {
      const x = i * step;
      const y = H - (H * (v - min)) / (max - min);
      return `${x},${y}`;
    });
    return `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  }, []);

  const exportAttemptsCSV = () => {
    const rows = [
      ["attemptId", "examTitle", "date", "duration", "scorePct", "status"],
      ...attempts.map(a => [a.id, a.examTitle, a.date, a.duration, a.scorePct, a.status]),
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `course_${id}_student_${userId}_attempts.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [
      { id: Date.now(), at: new Date().toISOString().slice(0, 16).replace("T", " "), text: newNote.trim() },
      ...prev,
    ]);
    setNewNote("");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải dữ liệu...
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/i/courses/${id}/students`}
              className="rounded-lg border px-3 py-1.5 hover:bg-white/60 inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white grid place-items-center text-sm font-bold">
                {s.name.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Tiến độ học viên — {s.name}
                </h1>
                <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                  <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" /> Ghi danh {s.enrolledAt}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="w-4 h-4" /> Hoạt động gần nhất {s.lastActive}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAttemptsCSV}
              className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white"
            >
              <Download className="w-4 h-4 inline mr-1" /> Export Attempts
            </button>
            <button
              onClick={() => alert("Nhắn tin (demo)")}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" /> Nhắn tin
            </button>
            <button
              onClick={() => alert("Đặt lại tiến độ (demo)")}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset tiến độ
            </button>
            <button
              onClick={() => alert("Thu hồi quyền (demo)")}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-white inline-flex items-center gap-2 text-rose-700 border-rose-200"
            >
              <Ban className="w-4 h-4" /> Thu hồi quyền
            </button>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-8">
        {/* LEFT: KPI + TIMELINE + ATTEMPTS */}
        <section className="space-y-8">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI icon={<Gauge className="w-4 h-4" />} label="Tiến độ" value={`${s.progress}%`}>
              <Radial pct={s.progress} />
            </KPI>
            <KPI icon={<BookOpen className="w-4 h-4" />} label="Bài đã học" value={`${s.lessonsDone}/${s.lessonsTotal}`} />
            <KPI icon={<BarChart3 className="w-4 h-4" />} label="Điểm TB" value={`${s.avgScore}%`}>
              <Spark series={MOCK_PROGRESS_SERIES} path={sparkPath} />
            </KPI>
            <KPI icon={<Target className="w-4 h-4" />} label="Thời gian học" value={timeSpentFmt} />
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Tiến độ theo bài học</h2>
              {s.certificate && (
                <span className="inline-flex items-center gap-1 text-sm text-indigo-700">
                  <Award className="w-4 h-4" /> Đã cấp chứng chỉ
                </span>
              )}
            </div>

            <ul className="mt-4 relative">
              {timeline.map((l, i) => (
                <li key={l.id} className="pl-8 pb-5 last:pb-0 relative">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-[11px] top-4 bottom-[-8px] w-[2px] bg-gray-200" />
                  )}
                  <span
                    className={`absolute left-0 top-1.5 w-5 h-5 rounded-full grid place-items-center ${
                      l.doneAt ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {l.doneAt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
                  </span>

                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium text-gray-900">{l.title}</div>
                      <div className="text-xs text-gray-600">
                        Loại: {l.type} {l.duration !== "—" && `• ${l.duration}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {l.doneAt ? `Hoàn thành ${l.doneAt}` : "Chưa hoàn thành"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Attempts */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Lượt làm bài thi</h2>
              <button
                onClick={exportAttemptsCSV}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-5">Đề thi</div>
              <div className="col-span-2">Thời gian</div>
              <div className="col-span-2 text-center">Điểm</div>
              <div className="col-span-1 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Xem</div>
            </div>

            {attempts.map(a => (
              <div key={a.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                <div className="col-span-5">
                  <div className="font-medium text-gray-900">{a.examTitle}</div>
                  <div className="text-xs text-gray-600">{a.date} • {a.duration}</div>
                </div>
                <div className="col-span-2 text-sm text-gray-700">{a.date}</div>
                <div className="col-span-2 text-center">
                  <span className={`text-sm font-semibold ${a.scorePct >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                    {a.scorePct}%
                  </span>
                </div>
                <div className="col-span-1 text-center text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{a.status}</span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Link
                    to={`/s/results/${a.id}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  >
                    Chi tiết <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: Insights + Notes */}
        <aside className="space-y-6">
          <InsightBox series={MOCK_PROGRESS_SERIES} path={sparkPath} />
          <NotesBox notes={notes} newNote={newNote} setNewNote={setNewNote} addNote={addNote} />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* === Subcomponents === */
function KPI({ icon, label, value, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs text-gray-600 flex items-center gap-2">{icon}{label}</div>
      <div className="mt-1 flex items-end justify-between">
```jsx
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        {children}
      </div>
    </div>
  );
}

function Radial({ pct }) {
  return (
    <div
      className="w-12 h-12 rounded-full grid place-items-center text-sm font-bold"
      style={{
        background: `conic-gradient(#2563eb ${pct * 3.6}deg, #e5e7eb 0)`,
      }}
      title={`${pct}%`}
    >
      <span className="bg-white w-8 h-8 rounded-full grid place-items-center shadow-inner">{pct}%</span>
    </div>
  );
}

function Spark({ series, path }) {
  const W = 120, H = 36;
  const last = series.at(-1);
  const first = series[0];
  const tone = last >= first ? "text-emerald-600" : "text-rose-600";
  return (
    <svg width={W} height={H} viewBox={`0 0 120 36`} className={`ml-3 ${tone}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function InsightBox({ series, path }) {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="text-xs text-gray-600 inline-flex items-center gap-2">
        <BarChart3 className="w-4 h-4" /> Xu hướng điểm
      </div>
      <Spark series={series} path={path} />
      <div className="text-xs text-gray-600">
        Tăng từ {series[0]}% → {series.at(-1)}% trong {series.length} mốc.
      </div>
    </div>
  );
}

function NotesBox({ notes, newNote, setNewNote, addNote }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Ghi chú nội bộ</h3>
      <div className="flex gap-2">
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Thêm ghi chú (chỉ giảng viên thấy)…"
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addNote}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
        >
          Lưu
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {notes.map(n => (
          <div key={n.id} className="rounded-lg border bg-gray-50 p-3">
            <div className="text-xs text-gray-500">{n.at}</div>
            <div className="text-sm text-gray-800">{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

