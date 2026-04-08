// src/pages/instructor/Exams.jsx
"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Plus, Search, Filter, BarChart3, Edit3, UsersRound, ArrowUpDown, MoreVertical,
  CheckCircle2, XCircle, Rocket, Undo2, Eye, Copy, CalendarRange, ChevronLeft, ChevronRight, Download
} from "lucide-react";

/* ================= Mock data ================= */
const EXAMS = [
  { id: 1,  title: "JS Cơ bản – 60 câu",      course: "React 18 Pro",      attempts: 421, avg: 68, status: "published", updated: "2025-11-03" },
  { id: 2,  title: "React Hooks – 40 câu",     course: "React 18 Pro",      attempts: 312, avg: 71, status: "published", updated: "2025-11-01" },
  { id: 3,  title: "Node REST – 50 câu",       course: "Node.js RESTful",   attempts: 128, avg: 62, status: "draft",     updated: "2025-10-30" },
  { id: 4,  title: "SQL Practical – 45 câu",   course: "SQL Practical",     attempts: 205, avg: 74, status: "published", updated: "2025-10-28" },
  { id: 5,  title: "TypeScript – 40 câu",      course: "TS Essentials",     attempts: 0,   avg: 0,  status: "draft",     updated: "2025-10-27" },
  { id: 6,  title: "Kubernetes – 35 câu",      course: "K8s cơ bản",        attempts: 54,  avg: 59, status: "published", updated: "2025-10-25" },
  { id: 7,  title: "CI/CD – 30 câu",           course: "DevOps cơ bản",     attempts: 77,  avg: 65, status: "published", updated: "2025-10-24" },
];

const STATUS_BADGE = (s) =>
  s === "published"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-gray-100 text-gray-700";

/* ================= Page ================= */
export default function InstructorExams() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [course, setCourse] = useState("all");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const courses = useMemo(
    () => ["all", ...Array.from(new Set(EXAMS.map((e) => e.course)))],
    []
  );

  const filtered = useMemo(() => {
    let list = [...EXAMS];

    // search
    if (q.trim()) {
      const k = q.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(k) ||
          e.course.toLowerCase().includes(k)
      );
    }
    // status
    if (status !== "all") list = list.filter((e) => e.status === status);
    // course
    if (course !== "all") list = list.filter((e) => e.course === course);

    // sort
    list.sort((a, b) => {
      switch (sortBy) {
        case "title_asc": return a.title.localeCompare(b.title);
        case "title_desc": return b.title.localeCompare(a.title);
        case "attempts_desc": return b.attempts - a.attempts;
        case "attempts_asc": return a.attempts - b.attempts;
        case "avg_desc": return b.avg - a.avg;
        case "avg_asc": return a.avg - b.avg;
        case "updated_asc": return a.updated.localeCompare(b.updated);
        case "updated_desc":
        default: return b.updated.localeCompare(a.updated);
      }
    });
    return list;
  }, [q, status, course, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageData = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  const stat = useMemo(() => {
    const pub = EXAMS.filter((e) => e.status === "published");
    const draft = EXAMS.filter((e) => e.status === "draft");
    const attempts = EXAMS.reduce((s, e) => s + e.attempts, 0);
    const avg =
      Math.round(
        (EXAMS.filter((e) => e.attempts > 0).reduce((s, e) => s + e.avg, 0) /
          Math.max(1, EXAMS.filter((e) => e.attempts > 0).length)) * 10
      ) / 10;
    return { pub: pub.length, draft: draft.length, attempts, avg };
  }, []);

  const exportCSV = () => {
    const rows = [
      ["id", "title", "course", "status", "attempts", "avg", "updated"],
      ...filtered.map((e) => [e.id, e.title, e.course, e.status, e.attempts, e.avg, e.updated]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "exams.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* Hero */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">🧠 Đề thi do tôi tạo</h1>
            <p className="text-gray-600">Quản lý đề, chỉnh sửa, xem thống kê & lượt làm</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl border border-gray-300 hover:bg-gray-50 px-4 py-2 text-sm font-medium text-gray-800 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link
              to="/i/exams/new"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tạo đề thi
            </Link>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        {/* Stats mini */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm text-gray-600 flex items-center gap-2"><UsersRound className="w-4 h-4" /> Tổng lượt làm</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{stat.attempts}</div>
            <div className="text-xs text-gray-500 mt-1">Tính trên {EXAMS.length} đề</div>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm text-gray-600 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Điểm TB</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{stat.avg}%</div>
            <div className="text-xs text-gray-500 mt-1">TB các đề có lượt làm</div>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Published</div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-700">{stat.pub}</div>
            <div className="text-xs text-gray-500 mt-1">Đang mở bán</div>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm text-gray-600 flex items-center gap-2"><XCircle className="w-4 h-4 text-gray-600" /> Draft</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{stat.draft}</div>
            <div className="text-xs text-gray-500 mt-1">Chưa publish</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm đề theo tên hoặc khoá học…"
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
              <option value="all">Trạng thái: Tất cả</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-gray-600" />
            <select
              value={course}
              onChange={(e) => { setCourse(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Khoá học: Tất cả" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="updated_desc">Sắp xếp: Mới cập nhật</option>
              <option value="updated_asc">Cũ nhất</option>
              <option value="title_asc">Tên A → Z</option>
              <option value="title_desc">Tên Z → A</option>
              <option value="attempts_desc">Lượt làm ↓</option>
              <option value="attempts_asc">Lượt làm ↑</option>
              <option value="avg_desc">Điểm TB ↓</option>
              <option value="avg_asc">Điểm TB ↑</option>
            </select>
          </div>
        </div>

        {/* List (table-like cards) */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b">
            <div className="col-span-5">Đề thi</div>
            <div className="col-span-3">Khoá học</div>
            <div className="col-span-1 text-center">Lượt</div>
            <div className="col-span-1 text-center">Avg%</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {pageData.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-600">
              Không có đề nào khớp bộ lọc hiện tại.
            </div>
          )}

          {pageData.map((e) => (
            <div key={e.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
              <div className="col-span-5">
                <div className="font-medium text-gray-900">{e.title}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE(e.status)}`}>{e.status}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="w-3.5 h-3.5" /> {e.updated}
                  </span>
                </div>
              </div>

              <div className="col-span-3 text-sm text-gray-700">{e.course}</div>

              <div className="col-span-1 text-center text-sm text-gray-800 inline-flex items-center gap-1 justify-center">
                <UsersRound className="w-4 h-4" /> {e.attempts}
              </div>

              <div className={`col-span-1 text-center text-sm font-semibold ${e.avg >= 70 ? "text-emerald-700" : "text-gray-800"}`}>
                {e.avg}%
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/i/exams/${e.id}/stats`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" /> Stats
                  </Link>
                  <Link
                    to={`/i/exams/${e.id}/edit`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" /> Sửa
                  </Link>

                  {/* Quick menu (demo) */}
                  <div className="relative group">
                    <button className="rounded-lg border px-2 py-1.5 hover:bg-gray-50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-lg hidden group-hover:block z-10">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Xem trang giới thiệu
                      </button>
                      {e.status === "draft" ? (
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                          <Rocket className="w-4 h-4" /> Publish
                        </button>
                      ) : (
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                          <Undo2 className="w-4 h-4" /> Chuyển Draft
                        </button>
                      )}
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={curPage === 1}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm ${
                curPage === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - curPage) <= 2;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const ellipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="inline-flex">
                    {ellipsis && <span className="px-2 text-gray-400">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        p === curPage ? "bg-blue-600 text-white" : "border text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={curPage === totalPages}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm ${
                curPage === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
