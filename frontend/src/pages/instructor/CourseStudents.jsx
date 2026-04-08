// src/pages/instructor/CourseStudents.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Users, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Mail, UserRound,
  Download, MoreHorizontal, CheckCircle2, PauseCircle, RotateCcw, Ban, Award,
  BarChart3, CalendarDays, Gauge, ArrowUpDown, UserCheck, UserX
} from "lucide-react";

/* ===== Mock data (thay bằng API thực) ===== */
const MOCK_STUDENTS = Array.from({ length: 58 }, (_, i) => {
  const pct = Math.floor(Math.random() * 101);
  const status = pct === 100 ? "completed" : pct < 5 ? "paused" : "active";
  const attempts = Math.floor(Math.random() * 6);
  return {
    id: 1000 + i,
    name: ["Lê Minh", "Nguyễn Hoa", "Phạm Tuấn", "Trần Dũng", "Vũ Hạnh", "Phan Huy", "Bùi Nga", "Đỗ Lộc"][i % 8],
    email: `student${i + 1}@mail.com`,
    enrolledAt: `2025-10-${String((i % 28) + 1).padStart(2, "0")}`,
    lastActive: `2025-11-${String(((i + 7) % 27) + 1).padStart(2, "0")}`,
    progress: pct,
    lessonsDone: Math.floor((pct / 100) * 42),
    lessonsTotal: 42,
    scoreAvg: attempts ? Math.floor(50 + Math.random() * 50) : null,
    attempts,
    status, // 'active' | 'paused' | 'completed' | 'refunded'
    certificate: pct === 100,
  };
});

const MiniBar = ({
  value,
  v,
  color = "blue",        // blue | emerald | amber | rose | violet ...
  className = "",
}) => {
  const pct = Math.max(0, Math.min(100, Number(value ?? v ?? 0)));
  const colorMap = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    violet: "bg-violet-600",
    slate: "bg-slate-700",
  };
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full ${colorMap[color] || colorMap.blue}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  refunded: "bg-rose-100 text-rose-700",
};

const PAGE_SIZE = 12;

export default function CourseStudents() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  // ========== States ==========
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent | name | progress | score
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);

  // ========== Derived ==========
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let arr = MOCK_STUDENTS.filter((s) => {
      const okQ =
        !ql ||
        s.name.toLowerCase().includes(ql) ||
        s.email.toLowerCase().includes(ql);
      const okStatus = status === "all" ? true : s.status === status;
      return okQ && okStatus;
    });

    // sort
    arr = arr.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "score") return (b.scoreAvg ?? -1) - (a.scoreAvg ?? -1);
      // recent (lastActive desc)
      return b.lastActive.localeCompare(a.lastActive);
    });

    return arr;
  }, [q, status, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allSelectedOnPage = view.length > 0 && view.every((s) => selected.has(s.id));
  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allSelectedOnPage) {
      view.forEach((s) => next.delete(s.id));
    } else {
      view.forEach((s) => next.add(s.id));
    }
    setSelected(next);
  };

  // ========== Stats (sidebar) ==========
  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((s) => s.status === "active").length;
    const paused = filtered.filter((s) => s.status === "paused").length;
    const completed = filtered.filter((s) => s.status === "completed").length;
    const avgProgress = Math.round(
      filtered.reduce((sum, s) => sum + s.progress, 0) / (filtered.length || 1)
    );
    const avgScore = Math.round(
      filtered.reduce((sum, s) => sum + (s.scoreAvg ?? 0), 0) /
        (filtered.filter((s) => s.scoreAvg != null).length || 1)
    );
    return { total, active, paused, completed, avgProgress, avgScore };
  }, [filtered]);

  // ========== Actions ==========
  const exportCSV = () => {
    const rows = [
      [
        "id",
        "name",
        "email",
        "enrolledAt",
        "lastActive",
        "progress",
        "lessonsDone",
        "lessonsTotal",
        "scoreAvg",
        "attempts",
        "status",
        "certificate",
      ],
      ...filtered.map((s) => [
        s.id,
        s.name,
        s.email,
        s.enrolledAt,
        s.lastActive,
        s.progress,
        s.lessonsDone,
        s.lessonsTotal,
        s.scoreAvg ?? "",
        s.attempts,
        s.status,
        s.certificate ? "yes" : "no",
      ]),
    ]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `course_${id}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearSelection = () => setSelected(new Set());

  const bulk = {
    message: () => alert(`Nhắn tin ${selected.size} học viên (demo).`),
    resetProgress: () => {
      alert(`Đặt lại tiến độ cho ${selected.size} học viên (demo).`);
      clearSelection();
    },
    revoke: () => {
      alert(`Thu hồi quyền truy cập ${selected.size} học viên (demo).`);
      clearSelection();
    },
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* Hero */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">👥 Học viên của khoá #{id}</h1>
            <p className="text-gray-600">
              Theo dõi tiến độ, điểm số, lượt làm bài và quản lý quyền truy cập
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link
              to={`/i/courses/${id}/edit`}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
            >
              Quay về chỉnh sửa
            </Link>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.5fr_420px] gap-8">
        {/* LEFT: table & controls */}
        <section className="space-y-6">
          {/* Toolbar */}
          <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-[44%]">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên hoặc email…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang học</option>
                <option value="paused">Tạm dừng</option>
                <option value="completed">Hoàn thành</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>

              <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="recent">Hoạt động gần đây</option>
                <option value="name">Tên (A→Z)</option>
                <option value="progress">Tiến độ (cao→thấp)</option>
                <option value="score">Điểm TB (cao→thấp)</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="rounded-xl border bg-indigo-50 border-indigo-200 p-3 flex items-center justify-between">
              <div className="text-sm text-indigo-900">
                Đã chọn <b>{selected.size}</b> học viên
              </div>
              <div className="flex items-center gap-2">
                <button onClick={bulk.message} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Nhắn tin
                </button>
                <button onClick={bulk.resetProgress} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset tiến độ
                </button>
                <button onClick={bulk.revoke} className="rounded-lg border px-3 py-1.5 text-sm bg-white inline-flex items-center gap-2 text-rose-700 border-rose-200">
                  <Ban className="w-4 h-4" /> Thu hồi quyền
                </button>
                <button onClick={clearSelection} className="rounded-lg border px-3 py-1.5 text-sm">
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={toggleAllOnPage}
                />
                Học viên
              </div>
              <div className="col-span-2">Tiến độ</div>
              <div className="col-span-1 text-center">Điểm TB</div>
              <div className="col-span-1 text-center">Lượt làm</div>
              <div className="col-span-1">Hoạt động</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {view.map((s) => {
              const checked = selected.has(s.id);
              return (
                <div key={s.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                  {/* Student info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(selected);
                        e.target.checked ? next.add(s.id) : next.delete(s.id);
                        setSelected(next);
                      }}
                    />
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-bold">
                      {s.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-600 truncate">{s.email}</div>
                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_BADGE[s.status]}`}>
                          {s.status}
                        </span>
                        <span className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Enrolled {s.enrolledAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="col-span-2 pr-4">
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span>{s.lessonsDone}/{s.lessonsTotal} bài</span>
                      <span className="font-semibold">{s.progress}%</span>
                    </div>
                    <div className="mt-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.progress === 100 ? "bg-indigo-600" : s.progress > 60 ? "bg-emerald-600" : s.progress > 30 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    {s.certificate && (
                      <div className="mt-1 text-[10px] text-indigo-700 inline-flex items-center gap-1">
                        <Award className="w-3 h-3" /> Đã cấp chứng chỉ
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="col-span-1 text-center text-sm text-gray-800">
                    {s.scoreAvg != null ? `${s.scoreAvg}%` : "—"}
                  </div>

                  {/* Attempts */}
                  <div className="col-span-1 text-center text-sm text-gray-800">{s.attempts}</div>

                  {/* Last active */}
                  <div className="col-span-1 text-sm text-gray-700">{s.lastActive}</div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/i/courses/${id}/students/${s.id}`}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                        title="Xem chi tiết tiến độ"
                      >
                        <BarChart3 className="w-4 h-4" /> Tiến độ
                      </Link>
                      <button
                        onClick={() => alert("Nhắn tin (demo)")}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                        title="Nhắn tin"
                      >
                        <Mail className="w-4 h-4" /> Nhắn tin
                      </button>
                      <div className="relative">
                        <button className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {/* (Bạn có thể thêm dropdown thực tế ở đây) */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(
                safePage * PAGE_SIZE,
                filtered.length
              )} / {filtered.length} học viên
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
              <span className="text-sm">
                Trang <b>{safePage}</b> / {pages}
              </span>
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
        </section>

        {/* RIGHT: insights & quick tools */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Overview cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" /> Tổng học viên
              </div>
              <div className="mt-1 text-2xl font-extrabold text-blue-700">{stats.total}</div>
              <div className="text-xs text-gray-500">Bộ lọc hiện tại</div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> Tiến độ TB
              </div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">{stats.avgProgress}%</div>
              <div className="text-xs text-gray-500">Hoàn thành bình quân</div>
            </div>
          </div>

          {/* Split by status */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Trạng thái học tập</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <BadgeStat icon={<UserCheck className="w-4 h-4 text-emerald-600" />} label="Active" value={stats.active} hint="đang học" />
              <BadgeStat icon={<PauseCircle className="w-4 h-4 text-amber-600" />} label="Paused" value={stats.paused} hint="tạm dừng" />
              <BadgeStat icon={<Award className="w-4 h-4 text-indigo-600" />} label="Completed" value={stats.completed} hint="đã xong" />
            </div>

            {/* Tiny bars */}
            <div className="mt-4 space-y-2">
              <MiniBar label="0–25%" pct={Math.round(percent(filtered, (s) => s.progress <= 25))} />
              <MiniBar label="26–60%" pct={Math.round(percent(filtered, (s) => s.progress > 25 && s.progress <= 60))} />
              <MiniBar label="61–99%" pct={Math.round(percent(filtered, (s) => s.progress > 60 && s.progress < 100))} />
              <MiniBar label="100%" pct={Math.round(percent(filtered, (s) => s.progress === 100))} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Hành động nhanh</h3>
            <div className="grid gap-2">
              <button
                onClick={() => alert("Nhắn tin toàn bộ active (demo).")}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Nhắn tin học viên active
              </button>
              <button
                onClick={() => navigate(`/i/courses/${id}/reviews`)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" /> Xem review khoá
              </button>
              <button
                onClick={() => navigate(`/i/courses/${id}/students/42`)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <UserRound className="w-4 h-4" /> Một hồ sơ mẫu
              </button>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* ===== Helpers ===== */
function percent(arr, pred) {
  if (!arr.length) return 0;
  const n = arr.filter(pred).length;
  return (n / arr.length) * 100;
}

function BadgeStat({ icon, label, value, hint }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-600 inline-flex items-center gap-2">{icon} {label}</div>
      <div className="text-lg font-extrabold text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-500">{hint}</div>
    </div>
  );
}


































