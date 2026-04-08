// src/pages/instructor/ExamAttempts.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Filter, Search, Download, Users2, Clock, Smartphone, ShieldAlert,
  CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight, Globe, RefreshCcw, Ban,
} from "lucide-react";

/* =========================
   MOCK DATA (thay bằng API khi có backend)
========================= */
const META = {
  title: "React Hooks – 40 câu",
  course: "React 18 Pro",
  passPct: 60,
};

const rnd = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const devices = ["desktop", "mobile"];
const statusOf = (score, flagged) =>
  flagged ? "flagged" : score >= META.passPct ? "passed" : "failed";

const ATTEMPTS = Array.from({ length: 52 }).map((_, i) => {
  const score = rnd(35, 95);
  const flagged = Math.random() < 0.12 ? true : false;
  const started = new Date(2025, 10, rnd(1, 7), rnd(9, 21), rnd(0, 59)); // Nov 1-7, 2025
  const minutes = rnd(30, 75);
  const submitted = new Date(started.getTime() + minutes * 60000);
  const dev = devices[rnd(0, devices.length - 1)];
  const id = 100100 + i;
  return {
    id,
    userId: 5000 + i,
    name: ["Lê Minh", "Nguyễn Hoa", "Phạm Tuấn", "Trần Hà", "Bùi Khánh", "Đỗ Nam"][i % 6],
    email: `student${i}@study4.dev`,
    device: dev,
    ip: `27.68.${rnd(0,255)}.${rnd(0,255)}`,
    ua: dev === "mobile" ? "iPhone Safari 17" : "Chrome 119 Win",
    score,
    correct: Math.round((score / 100) * 40),
    durationMin: minutes,
    started,
    submitted,
    status: statusOf(score, flagged),
    flagged: flagged ? (Math.random() < 0.5 ? "Tab switching > 20 lần" : "IP thay đổi khi làm bài") : "",
    sections: [
      { id: "A", title: "Hooks cơ bản", score: rnd(50, 95), time: rnd(10, 20) },
      { id: "B", title: "Effect/Lifecycle", score: rnd(40, 90), time: rnd(10, 25) },
      { id: "C", title: "Memo & Context", score: rnd(45, 92), time: rnd(8, 20) },
    ],
  };
});

/* =========================
   HELPERS
========================= */
const fmtDate = (d) =>
  new Date(d).toLocaleString("vi-VN", { hour12: false });

const badgeStatus = (s) =>
  s === "passed"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "failed"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

const badgeDevice = (d) =>
  d === "mobile"
    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

const barW = (v, max = 100) => `${Math.min(100, Math.round((v / max) * 100))}%`;

const downloadCSV = (rows, filename) => {
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

/* =========================
   PAGE
========================= */
export default function ExamAttempts() {
  const { id } = useParams();
  useEffect(() => window.scrollTo(0, 0), [id]);

  // Filters / search / paging
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | passed | failed | flagged
  const [device, setDevice] = useState("all"); // all | desktop | mobile
  const [range, setRange] = useState("7d"); // 7d | 30d | 90d | all
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selection for bulk actions
  const [checked, setChecked] = useState(() => new Set());
  const toggleCheck = (aid) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(aid) ? next.delete(aid) : next.add(aid);
      return next;
    });
  const checkAllOnPage = (ids, on) =>
    setChecked((prev) => {
      const next = new Set(prev);
      ids.forEach((x) => (on ? next.add(x) : next.delete(x)));
      return next;
    });

  // Drawer state
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(null);

  // Derived filtered list
  const filtered = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    if (range === "7d") start.setDate(end.getDate() - 7);
    if (range === "30d") start.setDate(end.getDate() - 30);
    if (range === "90d") start.setDate(end.getDate() - 90);

    return ATTEMPTS.filter((a) => {
      const okQ =
        !q.trim() ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.email.toLowerCase().includes(q.toLowerCase()) ||
        String(a.id).includes(q);
      const okS = status === "all" ? true : a.status === status;
      const okD = device === "all" ? true : a.device === device;
      const okR =
        range === "all" ? true : a.started >= start && a.started <= end;
      return okQ && okS && okD && okR;
    }).sort((a, b) => b.started - a.started);
  }, [q, status, device, range]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, totalPages);
  const slice = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);
  const pageIds = slice.map((x) => x.id);
  const allCheckedOnPage = pageIds.every((x) => checked.has(x));

  const exportAttempts = () => {
    const rows = [["AttemptID","Name","Email","Score","Correct","Duration(min)","Device","IP","Started","Submitted","Status","Flag"]];
    filtered.forEach(a => rows.push([
      a.id, a.name, a.email, a.score, a.correct, a.durationMin, a.device, a.ip,
      fmtDate(a.started), fmtDate(a.submitted), a.status, a.flagged
    ]));
    downloadCSV(rows, `exam_${id}_attempts.csv`);
  };

  const bulkInvalidate = () => {
    if (!checked.size) return;
    const ok = window.confirm(`Vô hiệu hóa ${checked.size} lượt làm?`);
    if (!ok) return;
    alert("Đã đánh dấu vô hiệu (demo).");
    setChecked(new Set());
  };

  const bulkBan = () => {
    if (!checked.size) return;
    const ok = window.confirm(`Khoá thi lại đối với ${checked.size} lượt làm?`);
    if (!ok) return;
    alert("Đã khoá thi lại (demo).");
    setChecked(new Set());
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/i/exams/${id}/stats`} className="rounded-lg border px-3 py-1.5 hover:bg-white inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Thống kê
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📈🧾 Lượt làm đề #{id}</h1>
              <p className="text-gray-600">{META.title} • {META.course} • Chuẩn đạt: {META.passPct}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={exportAttempts} className="rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-white inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* FILTERS / TOOLBAR */}
      <section className="w-full px-6 lg:px-12 pt-6">
        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-16 z-10">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Tìm theo tên, email, AttemptID…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select value={status} onChange={(e)=>{setStatus(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                <option value="all">Tất cả trạng thái</option>
                <option value="passed">Đạt</option>
                <option value="failed">Trượt</option>
                <option value="flagged">Flagged</option>
              </select>
              <select value={device} onChange={(e)=>{setDevice(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                <option value="all">Tất cả thiết bị</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
              <select value={range} onChange={(e)=>{setRange(e.target.value); setPage(1);}} className="rounded-xl border px-3 py-2 text-sm">
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
                <option value="90d">90 ngày</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <button
              disabled={!checked.size}
              onClick={bulkInvalidate}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                checked.size ? "hover:bg-white" : "opacity-50 cursor-not-allowed"
              }`}
              title="Vô hiệu điểm của các lượt chọn"
            >
              <RefreshCcw className="w-4 h-4" /> Vô hiệu
            </button>
            <button
              disabled={!checked.size}
              onClick={bulkBan}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold inline-flex items-center gap-2 text-rose-700 border-rose-200 ${
                checked.size ? "hover:bg-rose-50" : "opacity-50 cursor-not-allowed"
              }`}
              title="Cấm thi lại với các lượt chọn"
            >
              <Ban className="w-4 h-4" /> Khoá thi lại
            </button>
          </div>
        </div>
      </section>

      {/* LIST */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-6">
        <div className="rounded-2xl border bg-white overflow-hidden">
          {/* header row */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50 items-center">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={allCheckedOnPage}
                onChange={(e) => checkAllOnPage(pageIds, e.target.checked)}
              />
            </div>
            <div className="col-span-2">Attempt</div>
            <div className="col-span-3">Học viên</div>
            <div className="col-span-2 text-center">Điểm</div>
            <div className="col-span-1 text-center">Thời gian</div>
            <div className="col-span-1 text-center">Thiết bị</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {/* rows */}
          {slice.map((a) => (
            <div key={a.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
              <div className="col-span-1">
                <input type="checkbox" checked={checked.has(a.id)} onChange={() => toggleCheck(a.id)} />
              </div>

              <div className="col-span-2">
                <div className="font-medium text-gray-900">#{a.id}</div>
                <div className="text-xs text-gray-600">{fmtDate(a.started)}</div>
              </div>

              <div className="col-span-3">
                <div className="font-medium text-gray-900 line-clamp-1">{a.name}</div>
                <div className="text-xs text-gray-600 line-clamp-1">{a.email}</div>
              </div>

              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeStatus(a.status)}`}>
                    {a.status === "passed" ? "Đạt" : a.status === "failed" ? "Trượt" : "Flagged"}
                  </span>
                  {a.flagged && <ShieldAlert className="w-4 h-4 text-amber-600" title={a.flagged} />}
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{a.score}%</div>
                <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${a.score >= META.passPct ? "bg-emerald-600" : "bg-rose-600"}`} style={{ width: barW(a.score) }} />
                </div>
                <div className="text-[11px] text-gray-600 mt-1">{a.correct}/40 đúng</div>
              </div>

              <div className="col-span-1 text-center text-sm text-gray-800">
                <div className="font-semibold">{a.durationMin}’</div>
                <div className="text-[11px] text-gray-600">{fmtDate(a.submitted).split(" ")[1]}</div>
              </div>

              <div className="col-span-1 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badgeDevice(a.device)}`}>
                  <Smartphone className="w-3.5 h-3.5" /> {a.device}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setFocus(a); setOpen(true); }}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  title="Xem chi tiết lượt làm"
                >
                  <Eye className="w-4 h-4" /> Xem
                </button>
                <button
                  onClick={() => alert("Đã vô hiệu (demo)")}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  title="Vô hiệu lượt làm này"
                >
                  <RefreshCcw className="w-4 h-4" /> Vô hiệu
                </button>
                <button
                  onClick={() => alert("Đã khoá thi lại (demo)")}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-rose-50 text-rose-700 inline-flex items-center gap-1 border-rose-200"
                  title="Cấm thi lại"
                >
                  <Ban className="w-4 h-4" /> Khoá
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị <b>{slice.length}</b> / {total} lượt • Trang {curPage}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={curPage === 1}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${curPage===1 ? "opacity-50 cursor-not-allowed" : "hover:bg-white"}`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={curPage === totalPages}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${curPage===totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-white"}`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* DRAWER: Attempt detail */}
      {open && focus && (
        <div className="fixed inset-0 z-30">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl border-l rounded-none sm:rounded-l-2xl overflow-y-auto">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Attempt #{focus.id}</div>
                <div className="text-lg font-bold text-gray-900">{focus.name}</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                Đóng
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* top badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeStatus(focus.status)}`}>
                  {focus.status === "passed" ? "Đạt" : focus.status === "failed" ? "Trượt" : "Flagged"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badgeDevice(focus.device)}`}>
                  <Smartphone className="w-3.5 h-3.5" /> {focus.device}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200">
                  <Clock className="w-3.5 h-3.5" /> {focus.durationMin}’
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200">
                  <Users2 className="w-3.5 h-3.5" /> {focus.correct}/40 đúng
                </span>
              </div>

              {/* score bar */}
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Điểm</div>
                  <div className="text-lg font-extrabold text-gray-900">{focus.score}%</div>
                </div>
                <div className="mt-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`${focus.score >= META.passPct ? "bg-emerald-600" : "bg-rose-600"} h-full`} style={{ width: barW(focus.score) }} />
                </div>
                <div className="mt-1 text-[11px] text-gray-600">Chuẩn đạt: {META.passPct}%</div>
              </div>

              {/* time & env */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-600 mb-1">Bắt đầu</div>
                  <div className="text-sm font-medium text-gray-900">{fmtDate(focus.started)}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-600 mb-1">Nộp bài</div>
                  <div className="text-sm font-medium text-gray-900">{fmtDate(focus.submitted)}</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-600 mb-1">IP</div>
                  <div className="text-sm font-medium text-gray-900 inline-flex items-center gap-1">
                    <Globe className="w-4 h-4" /> {focus.ip}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-600 mb-1">Trình duyệt/thiết bị</div>
                  <div className="text-sm font-medium text-gray-900">{focus.ua}</div>
                </div>
              </div>

              {/* per-section */}
              <div className="rounded-2xl border overflow-hidden">
                <div className="px-4 py-3 border-b text-sm font-semibold text-gray-900">Hiệu năng theo phần</div>
                <div className="divide-y">
                  {focus.sections.map((s) => (
                    <div key={s.id} className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">Phần {s.id} — {s.title}</div>
                      <div className="mt-2 grid grid-cols-6 gap-3 items-center">
                        <div className="col-span-4">
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: barW(s.score) }} />
                          </div>
                        </div>
                        <div className="col-span-1 text-sm text-gray-800">{s.score}%</div>
                        <div className="col-span-1 text-right text-xs text-gray-600">{s.time}’</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* flags */}
              {focus.flagged && (
                <div className="rounded-xl border p-4 bg-amber-50/50 border-amber-200">
                  <div className="text-sm font-semibold text-amber-800 inline-flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Cảnh báo gian lận/vi phạm
                  </div>
                  <div className="mt-1 text-sm text-amber-700">{focus.flagged}</div>
                </div>
              )}

              {/* actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert("Đã vô hiệu (demo)")}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Vô hiệu điểm
                </button>
                <button
                  onClick={() => alert("Đã khoá thi lại (demo)")}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-rose-50 text-rose-700 inline-flex items-center justify-center gap-2 border-rose-200"
                >
                  <Ban className="w-4 h-4" /> Khoá thi lại
                </button>
              </div>

              {/* result summary mini-grid (mock) */}
              <div className="rounded-2xl border">
                <div className="px-4 py-3 border-b text-sm font-semibold text-gray-900">Lưới đáp án (minimap)</div>
                <div className="p-4 grid grid-cols-10 gap-2">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const ok = i < focus.correct;
                    return (
                      <div
                        key={i}
                        className={`h-7 rounded text-[11px] grid place-items-center border ${
                          ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 pb-4 text-xs text-gray-600">
                  (Demo visual — thay bằng dữ liệu đáp án chi tiết khi có API)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
