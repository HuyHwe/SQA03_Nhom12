// src/pages/instructor/CourseEnrollments.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Users, Search, Filter, ArrowUpDown, Download, Plus, Mail, CheckCircle2, XCircle, RotateCcw,
  ChevronLeft, ChevronRight, CalendarDays, UserRound, BadgeDollarSign
} from "lucide-react";

/**
 * Quản trị ghi danh khoá (Instructor)
 *
 * API mapping:
 * - GET  api/courses/{courseId}/enrollments            -> danh sách
 * - GET  api/courses/{courseId}/enrollments/{enrollId} -> chi tiết (nối qua trang StudentProgress)
 * - POST api/courses/{courseId}/enrollments            -> ghi danh thủ công (email)
 * - PATCH api/courses/{courseId}/enrollments/{enrollId}/progress -> cập nhật tiến độ (trang khác)
 *
 * Lưu ý: ở đây các action duyệt/hủy/hoàn tiền là DEMO (mock) vì API chưa nêu rõ endpoint patch status.
 */

// ===== Mock enrollments (ISO datetime giống API) =====
const MOCK = Array.from({ length: 47 }, (_, i) => {
  const statuses = ["active", "paused", "completed", "refunded", "pending"];
  const status = statuses[i % statuses.length];
  const progress = status === "completed" ? 100 : Math.floor(Math.random() * 95);
  return {
    id: `en-${1000 + i}`,
    userId: `u-${2000 + i}`,
    userName: ["Lê Minh", "Nguyễn Hoa", "Phạm Tuấn", "Trần Dũng", "Vũ Hạnh", "Phan Huy", "Bùi Nga", "Đỗ Lộc"][i % 8],
    userEmail: `student${i + 1}@mail.com`,
    createdAt: `2025-10-${String((i % 28) + 1).padStart(2, "0")}T09:1${i % 10}:00.0000000`,
    updatedAt: `2025-11-${String(((i + 7) % 27) + 1).padStart(2, "0")}T1${i % 10}:20:45.0000000`,
    status,             // active | paused | completed | refunded | pending
    progress,           // %
    lessonsDone: Math.floor((progress / 100) * 42),
    lessonsTotal: 42,
    attempts: Math.floor(Math.random() * 5),
    pricePaid: [0, 19.99, 45.15, 39.93][i % 4],
  };
});

const PAGE_SIZE = 12;

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  refunded: "bg-rose-100 text-rose-700",
  pending: "bg-slate-100 text-slate-700",
};

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

export default function CourseEnrollments() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  // ====== Filters / sort / paging ======
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");       // all | active | paused | completed | refunded | pending
  const [sortBy, setSortBy] = useState("recent");    // recent | name | progress | created_old
  const [page, setPage] = useState(1);

  // ====== Add enrollment (manual) – demo ======
  const [email, setEmail] = useState("");
  const [inviteNote, setInviteNote] = useState("");

  // ====== Data (mock) – thay bằng fetch GET api/courses/{id}/enrollments ======
  const data = MOCK;

  // Derived
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    let arr = data.filter(row => {
      const okQ = !k || row.userName.toLowerCase().includes(k) || row.userEmail.toLowerCase().includes(k);
      const okStatus = status === "all" ? true : row.status === status;
      return okQ && okStatus;
    });

    arr.sort((a, b) => {
      if (sortBy === "name") return a.userName.localeCompare(b.userName);
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "created_old") return a.createdAt.localeCompare(b.createdAt);
      // recent (updated desc)
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return arr;
  }, [data, q, status, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ====== Export ======
  const exportCSV = () => {
    const rows = [
      ["enrollmentId","userId","userName","userEmail","status","progress","lessonsDone","lessonsTotal","attempts","pricePaid","createdAt","updatedAt"],
      ...filtered.map(r => [
        r.id, r.userId, r.userName, r.userEmail, r.status, r.progress, r.lessonsDone, r.lessonsTotal, r.attempts, r.pricePaid, r.createdAt, r.updatedAt
      ])
    ].map(r => r.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `course_${id}_enrollments.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ====== Actions (demo) ======
  const approve = (row) => {
    if (row.status !== "pending") return alert("Chỉ áp dụng cho trạng thái pending (demo).");
    alert(`Duyệt ghi danh cho ${row.userEmail} (demo).`);
    // TODO: PATCH status nếu backend có
  };
  const reject = (row) => {
    if (row.status !== "pending") return alert("Chỉ áp dụng cho trạng thái pending (demo).");
    alert(`Từ chối ghi danh cho ${row.userEmail} (demo).`);
  };
  const refund = (row) => {
    if (row.status === "refunded") return alert("Đã hoàn tiền (demo).");
    alert(`Tạo yêu cầu hoàn tiền cho ${row.userEmail} (demo).`);
  };
  const sendMail = (row) => alert(`Gửi email cho ${row.userEmail} (demo).`);

  const createEnrollment = () => {
    if (!email.trim()) return;
    // TODO: call POST api/courses/{id}/enrollments body { email, note? }
    alert(`Đã gửi yêu cầu ghi danh thủ công cho ${email} (demo).`);
    setEmail(""); setInviteNote("");
  };

  // Stats (sidebar)
  const stats = useMemo(() => {
    const total = filtered.length;
    const by = (st) => filtered.filter(r => r.status === st).length;
    const avgProgress = Math.round(filtered.reduce((s, r) => s + r.progress, 0) / (filtered.length || 1));
    const revenue = filtered.reduce((s, r) => s + (Number(r.pricePaid) || 0), 0);
    return { total, active: by("active"), paused: by("paused"), completed: by("completed"), refunded: by("refunded"), pending: by("pending"), avgProgress, revenue };
  }, [filtered]);

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">🧾 Ghi danh khoá #{id}</h1>
            <p className="text-gray-600">Xem danh sách ghi danh, phê duyệt (pending), nhắn tin và export dữ liệu.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link to={`/i/courses/${id}/students`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">Xem học viên</Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.55fr_400px] gap-8">
        {/* LEFT: table & controls */}
        <section className="space-y-6">
          {/* Toolbar */}
          <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Tìm theo tên hoặc email…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="recent">Cập nhật gần đây</option>
                <option value="created_old">Ngày ghi danh cũ → mới</option>
                <option value="name">Tên A→Z</option>
                <option value="progress">Tiến độ cao→thấp</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-5">Học viên</div>
              <div className="col-span-2">Tiến độ</div>
              <div className="col-span-1 text-center">Lượt làm</div>
              <div className="col-span-2">Ngày</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {view.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-600">
                Không có bản ghi khớp bộ lọc hiện tại.
              </div>
            )}

            {view.map((r) => (
              <div key={r.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                {/* Student */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-bold">
                    {r.userName.slice(0,1)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{r.userName}</div>
                    <div className="text-xs text-gray-600 truncate">{r.userEmail}</div>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                      <span className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Enrolled {fmt(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-2 pr-4">
                  <div className="flex items-center justify-between text-xs text-gray-700">
                    <span>{r.lessonsDone}/{r.lessonsTotal} bài</span>
                    <span className="font-semibold">{r.progress}%</span>
                  </div>
                  <div className="mt-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${r.progress === 100 ? "bg-indigo-600" : r.progress > 60 ? "bg-emerald-600" : r.progress > 30 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>

                {/* Attempts */}
                <div className="col-span-1 text-center text-sm text-gray-800">{r.attempts}</div>

                {/* Dates */}
                <div className="col-span-2 text-xs text-gray-700">
                  <div>Updated: {fmt(r.updatedAt)}</div>
                  <div>Paid: {r.pricePaid ? `${r.pricePaid.toLocaleString("vi-VN")}đ` : "—"}</div>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/i/courses/${id}/students/${r.userId}`}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                      title="Xem tiến độ"
                    >
                      <Users className="w-4 h-4" /> Tiến độ
                    </Link>
                    <button
                      onClick={() => sendMail(r)}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                      title="Nhắn mail"
                    >
                      <Mail className="w-4 h-4" /> Mail
                    </button>

                    {r.status === "pending" ? (
                      <>
                        <button
                          onClick={() => approve(r)}
                          className="rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-1 text-emerald-700 border-emerald-200 hover:bg-gray-50"
                          title="Duyệt"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Duyệt
                        </button>
                        <button
                          onClick={() => reject(r)}
                          className="rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-1 text-rose-700 border-rose-200 hover:bg-gray-50"
                          title="Từ chối"
                        >
                          <XCircle className="w-4 h-4" /> Từ chối
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => refund(r)}
                        className="rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-1 hover:bg-gray-50"
                        title="Hoàn tiền (demo)"
                      >
                        <BadgeDollarSign className="w-4 h-4" /> Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} bản ghi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <span className="text-sm">Trang <b>{safePage}</b> / {pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={safePage === pages}
                className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${safePage === pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"}`}
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: quick tools & stats */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Quick add */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Ghi danh thủ công</h3>
            <div className="grid gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email người học…"
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)…"
                rows={2}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createEnrollment}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tạo ghi danh
              </button>
              <p className="text-[11px] text-gray-500">
                Sẽ gọi <code>POST api/courses/{id}/enrollments</code> khi backend sẵn sàng.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Tổng quan</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Tổng" value={stats.total} />
              <Stat label="Active" value={stats.active} pill="bg-emerald-100 text-emerald-700" />
              <Stat label="Paused" value={stats.paused} pill="bg-amber-100 text-amber-700" />
              <Stat label="Completed" value={stats.completed} pill="bg-indigo-100 text-indigo-700" />
              <Stat label="Refunded" value={stats.refunded} pill="bg-rose-100 text-rose-700" />
              <Stat label="Pending" value={stats.pending} pill="bg-slate-100 text-slate-700" />
            </div>
            <div className="mt-3 text-sm text-gray-700">
              Tiến độ TB: <b>{stats.avgProgress}%</b>
            </div>
            <div className="text-sm text-gray-700">
              Doanh thu (gross, mock): <b>{stats.revenue.toLocaleString("vi-VN")}đ</b>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Liên kết nhanh</h3>
            <div className="grid gap-2">
              <Link to={`/i/courses/${id}/students`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                <Users className="w-4 h-4" /> Danh sách học viên
              </Link>
              <Link to={`/i/courses/${id}/reviews`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                <UserRound className="w-4 h-4" /> Đánh giá khoá
              </Link>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* ===== Small UI pieces ===== */
function Stat({ label, value, pill }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-lg font-extrabold text-gray-900 mt-0.5">{value}</div>
      {pill && <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full ${pill}`}>{label}</span>}
    </div>
  );
}
