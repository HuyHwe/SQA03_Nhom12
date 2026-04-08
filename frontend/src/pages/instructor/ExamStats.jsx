// src/pages/instructor/ExamStats.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, CalendarDays, Filter, Download, BarChart3, Timer, Users2, Gauge,
  Layers3, LineChart, Info, AlertTriangle, CheckCircle2, Clock, Smartphone,
} from "lucide-react";

/* =========================
   MOCK DATA (demo)
   Thay bằng API thực khi có backend
========================= */
const MOCK_META = {
  title: "React Hooks – 40 câu",
  course: "React 18 Pro",
  version: "v5",
  sections: [
    { id: "A", title: "Cơ bản Hooks" },
    { id: "B", title: "Effect & Lifecycle" },
    { id: "C", title: "Memo hoá & Context" },
  ],
};

const MOCK_KPI = {
  attempts: 421,
  avg: 71.2,     // %
  median: 73,    // %
  kr20: 0.83,    // reliability
  avgTimeMin: 47,
};

const MOCK_HIST = [
  { bucket: "0–10", c: 2 }, { bucket: "10–20", c: 9 }, { bucket: "20–30", c: 18 },
  { bucket: "30–40", c: 32 }, { bucket: "40–50", c: 55 }, { bucket: "50–60", c: 74 },
  { bucket: "60–70", c: 98 }, { bucket: "70–80", c: 86 }, { bucket: "80–90", c: 36 },
  { bucket: "90–100", c: 11 },
];

const MOCK_SECTION = [
  { sec: "A", title: "Cơ bản Hooks", avg: 78, time: 14, discr: 0.36 },
  { sec: "B", title: "Effect & Lifecycle", avg: 66, time: 19, discr: 0.28 },
  { sec: "C", title: "Memo & Context", avg: 70, time: 14, discr: 0.31 },
];

// Item analysis: p = difficulty index (tỉ lệ đúng), r = discrimination (point-biserial ~ demo)
const MOCK_ITEMS = Array.from({ length: 15 }, (_, i) => ({
  id: 9001 + i,
  order: i + 1,
  text: i === 2
    ? "useEffect chạy sau mỗi lần render (đ/s)?"
    : i === 7
    ? "Điền tên hook tối ưu memo hoá giá trị: ____"
    : i === 10
    ? "Hook nào để truy cập giá trị giữ qua render không gây re-render?"
    : `Câu hỏi React/Hooks #${i + 1}`,
  sec: i < 5 ? "A" : i < 10 ? "B" : "C",
  p: [0.82, 0.64, 0.58, 0.41, 0.72, 0.69, 0.55, 0.33, 0.46, 0.79, 0.38, 0.61, 0.57, 0.29, 0.88][i],
  r: [0.21, 0.36, 0.31, 0.11, 0.29, 0.26, 0.34, 0.08, 0.17, 0.22, 0.07, 0.28, 0.25, 0.05, 0.24][i],
  timeSec: [52, 75, 88, 112, 69, 80, 95, 124, 101, 66, 132, 84, 90, 141, 48][i],
  choices: { A: [0.52, 0.12, 0.18, 0.18][0], B: 0.22, C: 0.17, D: 0.09 }, // demo %
  correct: ["A","B","A","D","B","C","C","A","B","D","C","B","A","D","A"][i],
}));

const MOCK_CONFUSION = [
  { qid: 9008, order: 8, sec: "B", correct: "A", most: "C", rate: 42 },
  { qid: 9011, order: 11, sec: "C", correct: "C", most: "B", rate: 38 },
  { qid: 9004, order: 4, sec: "A", correct: "D", most: "B", rate: 35 },
];

/* =========================
   SMALL HELPERS
========================= */
const badge = (val, goodHigh = true, warn = false) => {
  if (warn) return "bg-amber-50 text-amber-700 border-amber-200";
  return goodHigh
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
};
const barWidth = (v, max) => `${Math.round((v / max) * 100)}%`;
const fmtMin = (m) => `${m} phút`;
const fmtSec = (s) => `${Math.floor(s / 60)}’${String(s % 60).padStart(2, "0")}”`;
const p2 = (x) => `${(x * 100).toFixed(0)}%`;

/* =========================
   EXPORT HELPERS
========================= */
const downloadCSV = (rows, filename) => {
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/* =========================
   PAGE
========================= */
export default function ExamStats() {
  const { id } = useParams();

  // filters
  const [range, setRange] = useState("7d"); // 7d | 30d | 90d | all
  const [cohort, setCohort] = useState("all"); // all | new | repeat
  const [device, setDevice] = useState("all"); // all | desktop | mobile
  const [version, setVersion] = useState(MOCK_META.version);

  useEffect(() => window.scrollTo(0, 0), [id]);

  // derived (demo: không lọc thực sự)
  const kpi = MOCK_KPI;
  const hist = MOCK_HIST;
  const items = useMemo(() => {
    // ví dụ gắn flag cần xem lại (r < .1 hoặc p < .35 hoặc p> .9)
    return MOCK_ITEMS.map(it => ({
      ...it,
      flag:
        it.r < 0.1
          ? "Độ phân biệt thấp"
          : it.p < 0.35
          ? "Câu khó bất thường"
          : it.p > 0.9
          ? "Câu quá dễ"
          : "",
    }));
  }, []);

  const exportKPI = () => {
    const rows = [
      ["Metric", "Value"],
      ["Attempts", kpi.attempts],
      ["Average (%)", kpi.avg],
      ["Median (%)", kpi.median],
      ["KR-20", kpi.kr20],
      ["Avg time (min)", kpi.avgTimeMin],
    ];
    downloadCSV(rows, `exam_${id}_kpi.csv`);
  };

  const exportItems = () => {
    const rows = [["Order","QID","Section","p (diff)","r (discr)","AvgTime(s)","Flag"]];
    items.forEach(it => rows.push([it.order, it.id, it.sec, it.p, it.r, it.timeSec, it.flag]));
    downloadCSV(rows, `exam_${id}_items.csv`);
  };

  const exportConfusion = () => {
    const rows = [["Order","QID","Sec","Correct","MostChosen","ConfusionRate%"]];
    MOCK_CONFUSION.forEach(c => rows.push([c.order, c.qid, c.sec, c.correct, c.most, c.rate]));
    downloadCSV(rows, `exam_${id}_confusions.csv`);
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/i/exams" className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Đề của tôi
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📈 Thống kê đề thi #{id}</h1>
              <p className="text-gray-600">
                {MOCK_META.title} • {MOCK_META.course} • Phiên bản <b>{version}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportKPI} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export KPI
            </button>
            <button onClick={exportItems} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Items
            </button>
            <button onClick={exportConfusion} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Confusions
            </button>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="w-full px-6 lg:px-12 pt-6">
        <div className="rounded-2xl border bg-white p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays className="w-4 h-4" /> Khoảng:
            </div>
            <div className="flex gap-2">
              {["7d","30d","90d","all"].map(v => (
                <button
                  key={v}
                  onClick={() => setRange(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${range===v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:border-blue-400"}`}
                >
                  {v==="7d"?"7 ngày":v==="30d"?"30 ngày":v==="90d"?"90 ngày":"Tất cả"}
                </button>
              ))}
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-200" />
            <div className="inline-flex items-center gap-2 text-sm text-gray-700">
              <Filter className="w-4 h-4" /> Cohort:
            </div>
            <select value={cohort} onChange={(e)=>setCohort(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm">
              <option value="all">Tất cả</option>
              <option value="new">Học viên mới</option>
              <option value="repeat">Thi lại</option>
            </select>
            <div className="inline-flex items-center gap-2 text-sm text-gray-700">
              <Smartphone className="w-4 h-4" /> Thiết bị:
            </div>
            <select value={device} onChange={(e)=>setDevice(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm">
              <option value="all">Tất cả</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Phiên bản:</span>
            <select value={version} onChange={(e)=>setVersion(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm">
              <option>v5</option><option>v4</option><option>v3</option>
            </select>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-8">
        {/* LEFT: MAIN INSIGHTS */}
        <section className="space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-600 inline-flex items-center gap-1"><Users2 className="w-4 h-4" /> Attempts</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900">{kpi.attempts}</div>
              <div className="text-xs text-gray-500 mt-1">Trong phạm vi lọc</div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-600 inline-flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Avg</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">{kpi.avg.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">Điểm trung bình</div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-600 inline-flex items-center gap-1"><Gauge className="w-4 h-4" /> Median</div>
              <div className="mt-1 text-2xl font-extrabold text-indigo-700">{kpi.median}%</div>
              <div className="text-xs text-gray-500 mt-1">Trung vị</div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-600 inline-flex items-center gap-1"><LineChart className="w-4 h-4" /> KR-20</div>
              <div className="mt-1 text-2xl font-extrabold text-blue-700">{kpi.kr20}</div>
              <div className="text-xs text-gray-500 mt-1">Độ tin cậy</div>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-600 inline-flex items-center gap-1"><Timer className="w-4 h-4" /> Avg time</div>
              <div className="mt-1 text-2xl font-extrabold text-gray-900">{kpi.avgTimeMin}’</div>
              <div className="text-xs text-gray-500 mt-1">Phút / lượt</div>
            </div>
          </div>

          {/* Histogram phân bố điểm */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Phân bố điểm</div>
              <span className="text-xs text-gray-500">Mock chart</span>
            </div>
            <div className="mt-4 grid grid-cols-10 gap-2 items-end h-44">
              {(() => {
                const max = Math.max(...hist.map(h => h.c));
                return hist.map((h) => (
                  <div key={h.bucket} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-blue-100 rounded-lg overflow-hidden">
                      <div className="bg-blue-600" style={{ height: barWidth(h.c, max) }} />
                    </div>
                    <div className="text-[10px] text-gray-600">{h.bucket}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Breakdown theo section */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Hiệu năng theo phần (section)</div>
            </div>
            <div className="divide-y">
              {MOCK_SECTION.map((s) => (
                <div key={s.sec} className="px-5 py-4 grid grid-cols-12 items-center gap-3">
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">Phần {s.sec}</div>
                    <div className="text-xs text-gray-600">{s.title}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs text-gray-600 mb-1">Điểm TB</div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${s.avg}%` }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{s.avg}%</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs text-gray-600 mb-1">Thời gian TB</div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${Math.min(100, (s.time / 25) * 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{fmtMin(s.time)}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-xs text-gray-600 mb-1">Độ phân biệt</div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                      s.discr >= 0.3 ? badge(true) : s.discr >= 0.2 ? "bg-amber-50 text-amber-700 border-amber-200" : badge(false)
                    }`}>
                      {s.discr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item analysis table */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">Item analysis</div>
              <div className="text-xs text-gray-500">p: tỉ lệ đúng • r: độ phân biệt • thời gian: TB/ câu</div>
            </div>

            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Nội dung</div>
              <div className="col-span-1 text-center">Sec</div>
              <div className="col-span-1 text-center">p</div>
              <div className="col-span-1 text-center">r</div>
              <div className="col-span-1 text-center">Time</div>
              <div className="col-span-2 text-right">Flag</div>
            </div>

            {items.map((it) => (
              <div key={it.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                <div className="col-span-1 text-sm text-gray-700">{it.order}</div>
                <div className="col-span-5">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{it.text}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <Layers3 className="w-3.5 h-3.5" /> QID: {it.id}
                  </div>
                </div>
                <div className="col-span-1 text-center text-sm">{it.sec}</div>
                <div className="col-span-1 text-center">
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${
                    it.p > 0.9 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : it.p < 0.35 ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}>
                    {Math.round(it.p*100)}%
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${
                    it.r >= 0.3 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : it.r >= 0.2 ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {it.r}
                  </span>
                </div>
                <div className="col-span-1 text-center text-sm text-gray-700">{fmtSec(it.timeSec)}</div>
                <div className="col-span-2 text-right">
                  {it.flag ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> {it.flag}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: SIDE INSIGHTS */}
        <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
          {/* Quick notes */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-bold text-gray-900 mb-2">Gợi ý tối ưu (auto)</div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Phần <b>B</b> có điểm TB thấp (66%) và r = 0.28. Xem xét tách nhỏ nội dung.</li>
              <li>• Câu <b>#8</b> r = 0.08, tỉ lệ nhầm đáp án C = 42% → cần rà soát wording.</li>
              <li>• 23% lượt làm bằng Mobile; thời gian TB cao hơn +4’ so với Desktop.</li>
            </ul>
          </div>

          {/* Confusing pairs */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="text-sm font-bold text-gray-900">Câu dễ nhầm (Confusion)</div>
              <span className="text-xs text-gray-500">Dựa trên đáp án chọn nhiều</span>
            </div>
            <div className="divide-y">
              {MOCK_CONFUSION.map(c => (
                <div key={c.qid} className="px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-gray-900">Câu {c.order} • Sec {c.sec}</div>
                    <div className="text-xs text-gray-600">QID {c.qid}</div>
                  </div>
                  <div className="mt-1 text-xs text-gray-700">
                    Đúng: <b>{c.correct}</b> • Thường chọn nhầm: <b>{c.most}</b> • Tỉ lệ nhầm: <b>{c.rate}%</b>
                  </div>
                  <div className="mt-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600" style={{ width: `${c.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device / time insight (mock heat strip) */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-bold text-gray-900 mb-2">Thời lượng theo nhóm điểm</div>
            <div className="grid grid-cols-5 gap-2 text-[11px] text-gray-600 mb-2">
              <div>0–20</div><div>20–40</div><div>40–60</div><div>60–80</div><div>80–100</div>
            </div>
            <div className="grid grid-cols-5 gap-2 h-3">
              {[90, 84, 78, 69, 62].map((n,i)=>(
                <div key={i} className="rounded bg-indigo-200 relative overflow-hidden">
                  <div className="absolute inset-0" style={{ opacity: 0.25 + (i/8) }} />
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">Đơn vị: giây/câu (demo trực quan)</div>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-bold text-gray-900 mb-2">Chú giải</div>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
              <div className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">p &gt; 0.9</span>
                Câu quá dễ
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 text-xs">p &lt; 0.35</span>
                Câu khó bất thường
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 text-xs">r &lt; 0.1</span>
                Độ phân biệt thấp
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500 inline-flex items-start gap-2">
              <Info className="w-4 h-4" /> p = tỉ lệ đúng; r = hệ số tương quan điểm câu với tổng điểm (point-biserial, demo).
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
