// src/pages/instructor/CourseAnalytics.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Gauge, Users, DollarSign, BarChart2, CalendarDays, Download,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, PieChart
} from "lucide-react";

/**
 * Analytics cho 1 khoá học (Instructor)
 * Có thể nối với:
 *  - GET  api/courses/{courseId}/enrollments (đếm & phân tích)
 *  - GET  api/{courseId}/reviews           (điểm TB/đánh giá)
 *  - GET  api/course-content/{courseContentId}/lessons (đếm lesson)
 *
 * NOTE:
 * - Mock data dùng ISO datetime giống backend.
 * - Doanh thu = discountPrice (nếu có) * enrolls (mock), net 85% (demo).
 */

// ===== Mock (ISO datetime) =====
const MOCK_ENROLL_TRENDS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2025-10-10T00:00:00.0000000");
  d.setDate(d.getDate() + i);
  // ghi danh mỗi ngày
  const enrolls = Math.max(0, Math.round(10 + 8 * Math.sin(i / 3) + (Math.random() * 4 - 2)));
  // hoàn thành mỗi ngày (giả sử 40% của enrolls dịch trễ)
  const completed = Math.max(0, Math.round(enrolls * 0.4 * (i > 5 ? 1 : 0.4)));
  return {
    date: d.toISOString(), // ISO
    enrolls,
    completed,
    avgScore: Math.round(60 + 10 * Math.sin(i / 4) + (Math.random() * 8 - 4)), // %
  };
});

// kênh ghi danh (demo)
const MOCK_CHANNELS = [
  { channel: "Organic", count: 420 },
  { channel: "Referral", count: 160 },
  { channel: "Ads", count: 210 },
  { channel: "Email", count: 95 },
];

// phân bố tiến độ
const MOCK_PROGRESS_BUCKETS = [
  { label: "0–25%", count: 48 },
  { label: "26–60%", count: 96 },
  { label: "61–99%", count: 72 },
  { label: "100%", count: 34 },
];

// bài học “rớt” nhiều (tỉ lệ bỏ dở)
const MOCK_LESSON_DROP = [
  { id: 1202, title: "useEffect & lifecycle", abandonRate: 28 },
  { id: 1102, title: "Cài đặt môi trường",   abandonRate: 19 },
  { id: 1301, title: "Form & Validation",    abandonRate: 14 },
];

const money = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    .format(v);

const fmtD = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function CourseAnalytics() {
  const { id } = useParams(); // courseId
  useEffect(() => window.scrollTo(0, 0), []);

  // ===== Filters (demo) =====
  const [range, setRange] = useState({ from: "2025-10-15", to: "2025-11-13" }); // yyyy-MM-dd
  const [page, setPage] = useState(1);
  const PAGE = 12;

  // ===== Data (mock → thay bằng fetch khi nối API) =====
  const [trend, setTrend] = useState(MOCK_ENROLL_TRENDS);
  const [channels] = useState(MOCK_CHANNELS);
  const [buckets]  = useState(MOCK_PROGRESS_BUCKETS);
  const [dropList] = useState(MOCK_LESSON_DROP);

  // ===== Derived =====
  const inRange = useMemo(() => {
    const from = new Date(`${range.from}T00:00:00.0000000`);
    const to   = new Date(`${range.to}T23:59:59.9999999`);
    return trend.filter((t) => {
      const d = new Date(t.date);
      return d >= from && d <= to;
    });
  }, [trend, range]);

  const totals = useMemo(() => {
    const enrolls   = inRange.reduce((s, d) => s + d.enrolls, 0);
    const completed = inRange.reduce((s, d) => s + d.completed, 0);
    const avgScore  = Math.round(inRange.reduce((s, d) => s + d.avgScore, 0) / (inRange.length || 1));
    // giả định giá sau giảm 850,000đ (demo) → net 85%
    const revenue   = Math.round(enrolls * 850000 * 0.85);
    // so với 7 ngày trước cùng độ dài (demo)
    const prevSlice = trend.slice(Math.max(0, trend.length - inRange.length - 7), trend.length - 7);
    const prevEnrolls = prevSlice.reduce((s, d) => s + d.enrolls, 0) || 1;
    const deltaEnroll = Math.round(((enrolls - prevEnrolls) / prevEnrolls) * 100);
    return { enrolls, completed, avgScore, revenue, deltaEnroll };
  }, [inRange, trend]);

  // pagination cho bảng daily
  const pages = Math.max(1, Math.ceil(inRange.length / PAGE));
  const safePage = Math.min(page, pages);
  const dailyView = inRange.slice((safePage - 1) * PAGE, safePage * PAGE);

  // spark path (simple svg polyline)
  const sparkPath = useMemo(() => {
    const W = 160, H = 48;
    const max = Math.max(10, ...inRange.map(d => d.enrolls));
    const step = inRange.length > 1 ? W / (inRange.length - 1) : W;
    const pts = inRange.map((d, i) => {
      const x = i * step;
      const y = H - (d.enrolls / max) * H;
      return `${x},${y}`;
    });
    return { d: pts.length ? `M ${pts[0]} L ${pts.slice(1).join(" ")}` : "" , W, H };
  }, [inRange]);

  const exportCSV = () => {
    const rows = [
      ["dateISO", "date", "enrolls", "completed", "avgScore"],
      ...inRange.map((d) => [d.date, fmtD(d.date), d.enrolls, d.completed, d.avgScore]),
    ]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `course_${id}_analytics.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📈 Báo cáo & phân tích — Khoá #{id}</h1>
            <p className="text-gray-600">Theo dõi ghi danh, hoàn thành, điểm số & doanh thu ước tính theo thời gian.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link to={`/i/courses/${id}/students`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
              Học viên
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        {/* Filters */}
        <div className="rounded-2xl border bg-white p-4 flex flex-wrap items-center gap-3">
          <div className="text-sm text-gray-700 inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Khoảng ngày
          </div>
          <input
            type="date"
            value={range.from}
            onChange={(e) => { setRange(r => ({ ...r, from: e.target.value })); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <span>—</span>
          <input
            type="date"
            value={range.to}
            onChange={(e) => { setRange(r => ({ ...r, to: e.target.value })); setPage(1); }}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="ml-auto text-xs text-gray-500">Dữ liệu demo dùng ISO datetime chuẩn API</div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI
            icon={<Users className="w-4 h-4" />}
            label="Ghi danh"
            value={totals.enrolls}
            delta={totals.deltaEnroll}
          >
            <Spark d={sparkPath.d} W={sparkPath.W} H={sparkPath.H} up={totals.deltaEnroll >= 0} />
          </KPI>
          <KPI icon={<Gauge className="w-4 h-4" />} label="Hoàn thành" value={totals.completed} />
          <KPI icon={<BarChart2 className="w-4 h-4" />} label="Điểm TB" value={`${totals.avgScore}%`} />
          <KPI icon={<DollarSign className="w-4 h-4" />} label="Doanh thu (ước tính)" value={money(totals.revenue)} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Enroll trend (mini) */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-semibold text-gray-900">Xu hướng ghi danh</div>
            <div className="mt-3 text-xs text-gray-600">Theo ngày trong phạm vi đã chọn</div>
            <div className="mt-3">
              <Spark d={sparkPath.d} W={sparkPath.W} H={sparkPath.H} up />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {inRange.length ? `${fmtD(inRange[0].date)} → ${fmtD(inRange.at(-1).date)}` : "—"}
            </div>
          </div>

          {/* Channel share */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Kênh ghi danh
            </div>
            <div className="mt-3 space-y-2">
              {channels.map((c) => {
                const total = channels.reduce((s, x) => s + x.count, 0) || 1;
                const pct = Math.round((c.count / total) * 100);
                return (
                  <div key={c.channel}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{c.channel}</span>
                      <span className="text-gray-700 font-semibold">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress distribution */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-semibold text-gray-900">Phân bố tiến độ</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {buckets.map((b) => (
                <div key={b.label} className="rounded-xl border p-3">
                  <div className="text-xs text-gray-500">{b.label}</div>
                  <div className="text-lg font-extrabold text-gray-900">{b.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson drop list */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-lg font-bold text-gray-900">Bài học có tỉ lệ bỏ dở cao</div>
          </div>
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
            <div className="col-span-8">Bài học</div>
            <div className="col-span-2 text-center">Abandon rate</div>
            <div className="col-span-2 text-right">Xem</div>
          </div>

          {dropList.map((l) => (
            <div key={l.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
              <div className="col-span-8">
                <div className="font-medium text-gray-900">{l.title}</div>
                <div className="text-xs text-gray-600">ID: {l.id}</div>
              </div>
              <div className="col-span-2 text-center text-sm font-semibold text-rose-700">{l.abandonRate}%</div>
              <div className="col-span-2">
                <div className="flex items-center justify-end">
                  <Link
                    to={`/i/courses/${id}/lessons`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily table */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-lg font-bold text-gray-900">Nhật ký theo ngày</div>
          </div>

          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
            <div className="col-span-3">Ngày</div>
            <div className="col-span-3">Ghi danh</div>
            <div className="col-span-3">Hoàn thành</div>
            <div className="col-span-3 text-center">Điểm TB</div>
          </div>

          {dailyView.map((d, i) => (
            <div key={`${d.date}-${i}`} className="grid grid-cols-12 px-5 py-3 border-b last:border-b-0 items-center">
              <div className="col-span-3">{fmtD(d.date)}</div>
              <div className="col-span-3 text-gray-800">{d.enrolls}</div>
              <div className="col-span-3 text-gray-800">{d.completed}</div>
              <div className="col-span-3 text-center text-gray-800">{d.avgScore}%</div>
            </div>
          ))}

          <div className="px-5 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(safePage - 1) * PAGE + 1}–{Math.min(safePage * PAGE, inRange.length)} / {inRange.length} ngày
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
                  safePage === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <span className="text-sm">Trang <b>{safePage}</b> / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={safePage === pages}
                className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
                  safePage === pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
                }`}
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ===== UI bits ===== */
function KPI({ icon, label, value, delta, children }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs text-gray-600 inline-flex items-center gap-2">{icon} {label}</div>
      <div className="mt-1 flex items-end justify-between">
        <div>
          <div className="text-2xl font-extrabold text-gray-900">{value}</div>
          {delta != null && (
            <div className={`mt-0.5 text-xs inline-flex items-center gap-1 ${up ? "text-emerald-700" : "text-rose-700"}`}>
              {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(delta)}%
              <span className="text-gray-500"> vs. kỳ trước</span>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Spark({ d, W = 160, H = 48, up = true }) {
  if (!d) return <div className="w-[160px] h-[48px] bg-gray-50 rounded" />;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className={up ? "text-emerald-600" : "text-rose-600"}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
