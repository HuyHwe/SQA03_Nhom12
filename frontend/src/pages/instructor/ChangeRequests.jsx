// src/pages/instructor/ChangeRequests.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Search, Filter, ArrowUpDown, Download, XCircle, CheckCircle2, Clock, FileText,
  BookOpen, Film, RefreshCcw, Send, Eye, ChevronLeft, ChevronRight, ListFilter
} from "lucide-react";

/**
 * Trang tổng hợp yêu cầu mà giảng viên đã gửi:
 * - scope: "course" | "content" | "lesson"
 * - action: "request-publish" | "request-update"
 * - status: "pending" | "approved" | "rejected" | "cancelled"
 * ISO datetime bám theo format đã cung cấp.
 *
 * Khi nối API, bạn có thể:
 *   - GET danh sách "yêu cầu" từ backend (nếu có endpoint tổng hợp)
 *   - hoặc build từ các nguồn: course/content/lesson (history)
 *   - PATCH để huỷ (cancel) yêu cầu còn pending (nếu backend hỗ trợ).
 */

const MOCK = [
  // Course-level
  {
    id: "REQ-101",
    scope: "course",
    action: "request-publish",
    title: "React 18 Pro — Hooks, Router, Performance",
    courseId: "0ce5a138-3c42-4aca-a077-c32997a32d54",
    courseContentId: null,
    lessonId: null,
    status: "pending",
    createdAt: "2025-11-06T08:22:41.0000000",
    updatedAt: "2025-11-06T08:22:41.0000000",
    note: "Đã hoàn thiện curriculum & thumbnail.",
  },
  {
    id: "REQ-102",
    scope: "course",
    action: "request-update",
    title: "SQL Practical for Dev",
    courseId: "db-111",
    courseContentId: null,
    lessonId: null,
    status: "approved",
    createdAt: "2025-10-28T10:00:00.0000000",
    updatedAt: "2025-10-29T09:15:00.0000000",
    note: "Sửa mô tả + thêm mục tiêu học tập.",
  },
  // Course Content-level
  {
    id: "REQ-201",
    scope: "content",
    action: "request-update",
    title: "Course Content — React 18 Pro",
    courseId: "0ce5a138-3c42-4aca-a077-c32997a32d54",
    courseContentId: "cnt-777",
    lessonId: null,
    status: "rejected",
    createdAt: "2025-10-31T13:22:10.0000000",
    updatedAt: "2025-11-01T07:41:55.0000000",
    note: "Mô tả quá ngắn, bổ sung guideline SEO.",
  },
  // Lesson-level
  {
    id: "REQ-301",
    scope: "lesson",
    action: "request-update",
    title: "Lesson: useState & useEffect cơ bản",
    courseId: "0ce5a138-3c42-4aca-a077-c32997a32d54",
    courseContentId: "cnt-777",
    lessonId: "ls-1202",
    status: "pending",
    createdAt: "2025-11-05T19:03:00.0000000",
    updatedAt: "2025-11-05T19:03:00.0000000",
    note: "Thêm ví dụ cleanup & tối ưu dependency.",
  },
  {
    id: "REQ-302",
    scope: "lesson",
    action: "request-update",
    title: "Lesson: Router & Nested Routes",
    courseId: "0ce5a138-3c42-4aca-a077-c32997a32d54",
    courseContentId: "cnt-777",
    lessonId: "ls-1401",
    status: "cancelled",
    createdAt: "2025-10-25T09:40:00.0000000",
    updatedAt: "2025-10-26T08:10:00.0000000",
    note: "Huỷ do gửi nhầm snapshot.",
  },
];

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const ICON_BY_SCOPE = {
  course: <FileText className="w-4 h-4" />,
  content: <BookOpen className="w-4 h-4" />,
  lesson: <Film className="w-4 h-4" />,
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

const PAGE_SIZE = 10;

export default function ChangeRequests() {
  const { id } = useParams(); // có thể dùng /i/courses/:id/requests hoặc trang tổng hợp /i/requests
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  // ===== states
  const [items, setItems] = useState(MOCK);
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("all");  // all | course | content | lesson
  const [status, setStatus] = useState("all"); // all | pending | approved | rejected | cancelled
  const [action, setAction] = useState("all"); // all | request-publish | request-update
  const [sortBy, setSortBy] = useState("recent"); // recent | oldest
  const [page, setPage] = useState(1);

  // drawer/inline detail
  const [detailId, setDetailId] = useState(null);

  // ===== derived
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    let arr = items.filter((r) => {
      const okQ =
        !k ||
        r.title.toLowerCase().includes(k) ||
        r.note?.toLowerCase().includes(k) ||
        r.id.toLowerCase().includes(k);
      const okScope = scope === "all" ? true : r.scope === scope;
      const okStatus = status === "all" ? true : r.status === status;
      const okAction = action === "all" ? true : r.action === action;
      const okCourse = id ? r.courseId === id : true; // nếu routing theo course
      return okQ && okScope && okStatus && okAction && okCourse;
    });

    arr.sort((a, b) => {
      const aKey = a.updatedAt || a.createdAt;
      const bKey = b.updatedAt || b.createdAt;
      return sortBy === "oldest" ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey);
    });

    return arr;
  }, [items, q, scope, status, action, sortBy, id]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [q, scope, status, action, sortBy, id]);

  // ===== actions (mock)
  const cancelRequest = (req) => {
    if (req.status !== "pending") {
      alert("Chỉ có thể huỷ yêu cầu ở trạng thái Pending.");
      return;
    }
    if (!confirm(`Huỷ yêu cầu #${req.id}?`)) return;
    setItems((arr) =>
      arr.map((r) => (r.id === req.id ? { ...r, status: "cancelled", updatedAt: new Date().toISOString() } : r))
    );
    // TODO: PATCH tới endpoint huỷ yêu cầu nếu backend hỗ trợ
  };

  const exportCSV = () => {
    const rows = [
      ["id", "scope", "action", "title", "courseId", "courseContentId", "lessonId", "status", "createdAt", "updatedAt", "note"],
      ...filtered.map((r) => [
        r.id,
        r.scope,
        r.action,
        r.title,
        r.courseId ?? "",
        r.courseContentId ?? "",
        r.lessonId ?? "",
        r.status,
        r.createdAt,
        r.updatedAt ?? "",
        r.note ?? "",
      ]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = id ? `course_${id}_requests.csv` : "requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDetail = (rid) => setDetailId(rid);
  const closeDetail = () => setDetailId(null);

  // ===== UI
  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📬 Yêu cầu cập nhật/xuất bản {id ? `— Khoá #${id}` : ""}</h1>
            <p className="text-gray-600">Theo dõi trạng thái, xem chi tiết, huỷ yêu cầu đang chờ và export CSV.</p>
          </div>
          <div className="flex items-center gap-2">
            {id ? (
              <Link to={`/i/courses/${id}/edit`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                <Eye className="w-4 h-4" /> Quay về chỉnh sửa khoá
              </Link>
            ) : null}
            <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.55fr_420px] gap-8">
        {/* LEFT: table & controls */}
        <section className="space-y-6">
          {/* Toolbar */}
          <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-[44%]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo ID, tiêu đề hoặc ghi chú…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select value={scope} onChange={(e) => setScope(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                <option value="all">Phạm vi: Tất cả</option>
                <option value="course">Khóa học</option>
                <option value="content">Course Content</option>
                <option value="lesson">Bài học</option>
              </select>

              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                <option value="all">Trạng thái: Tất cả</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                <option value="all">Loại yêu cầu: Tất cả</option>
                <option value="request-publish">Xuất bản</option>
                <option value="request-update">Cập nhật</option>
              </select>

              <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                <option value="recent">Mới cập nhật</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-2">Yêu cầu</div>
              <div className="col-span-4">Tiêu đề / Ghi chú</div>
              <div className="col-span-2">Phạm vi</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Thao tác</div>
            </div>

            {view.length === 0 && (
              <div className="px-5 py-10 text-center text-gray-600">Không có yêu cầu nào khớp bộ lọc.</div>
            )}

            {view.map((r) => (
              <div key={r.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-start">
                <div className="col-span-2">
                  <div className="font-semibold text-gray-900">{r.id}</div>
                  <div className="text-xs text-gray-600 inline-flex items-center gap-1 mt-1">
                    {r.action === "request-publish" ? <Send className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                    {r.action === "request-publish" ? "Xuất bản" : "Cập nhật"}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    Tạo: {fmtDate(r.createdAt)} {r.updatedAt ? <>• Cập nhật: {fmtDate(r.updatedAt)}</> : null}
                  </div>
                </div>

                <div className="col-span-4 pr-4">
                  <div className="font-medium text-gray-900 line-clamp-2">{r.title}</div>
                  {r.note && <div className="text-sm text-gray-700 mt-1 line-clamp-2">{r.note}</div>}
                </div>

                <div className="col-span-2">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-700">
                    {ICON_BY_SCOPE[r.scope] || <FileText className="w-4 h-4" />}
                    <span className="capitalize">{r.scope}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {r.scope === "course" && <>courseId: <b>{r.courseId}</b></>}
                    {r.scope === "content" && <>contentId: <b>{r.courseContentId}</b></>}
                    {r.scope === "lesson" && <>lessonId: <b>{r.lessonId}</b></>}
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openDetail(r.id)}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <ListFilter className="w-4 h-4" /> Chi tiết
                    </button>
                    <button
                      onClick={() => cancelRequest(r)}
                      className={`rounded-lg border px-3 py-1.5 text-sm inline-flex items-center gap-1 ${
                        r.status === "pending" ? "hover:bg-gray-50" : "text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Huỷ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} yêu cầu
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

        {/* RIGHT: insights & help */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-bold text-gray-900 mb-2">Tóm tắt trạng thái</div>
            <StatLine icon={<Clock className="w-4 h-4 text-amber-600" />} label="Pending" value={countBy(items, "pending", id)} />
            <StatLine icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="Approved" value={countBy(items, "approved", id)} />
            <StatLine icon={<XCircle className="w-4 h-4 text-rose-600" />} label="Rejected" value={countBy(items, "rejected", id)} />
            <StatLine icon={<RefreshCcw className="w-4 h-4 text-gray-600" />} label="Cancelled" value={countBy(items, "cancelled", id)} />
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm font-bold text-gray-900 mb-2">Hướng dẫn nhanh</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <b>Xuất bản</b> dùng khi khoá/lesson đã sẵn sàng public.</li>
              <li>• <b>Cập nhật</b> dùng khi khoá/lesson đã public & cần chỉnh sửa.</li>
              <li>• Bạn chỉ có thể <b>huỷ</b> yêu cầu ở trạng thái <i>Pending</i>.</li>
            </ul>
            {id ? (
              <div className="mt-3 grid gap-2">
                <Link to={`/i/courses/${id}/edit`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Sửa khoá
                </Link>
                <Link to={`/i/courses/${id}/lessons`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> Quản lý bài học
                </Link>
              </div>
            ) : null}
          </div>
        </aside>
      </main>

      {/* Detail drawer (simple) */}
      {detailId && (
        <DetailSheet
          req={items.find((x) => x.id === detailId)}
          onClose={closeDetail}
          onCancel={cancelRequest}
        />
      )}

      <Footer />
    </div>
  );
}

/* ===== Small UI pieces ===== */
function StatLine({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="inline-flex items-center gap-2 text-gray-700">{icon}{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function DetailSheet({ req, onClose, onCancel }) {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Chi tiết yêu cầu #{req.id}</h3>
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Đóng</button>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <Row label="Loại">{req.action === "request-publish" ? "Xuất bản" : "Cập nhật"}</Row>
          <Row label="Phạm vi" className="capitalize">{req.scope}</Row>
          <Row label="Tiêu đề"><b>{req.title}</b></Row>
          <Row label="Trạng thái">
            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[req.status]}`}>{req.status}</span>
          </Row>
          <Row label="Thời gian tạo">{fmtDate(req.createdAt)}</Row>
          <Row label="Cập nhật">{fmtDate(req.updatedAt)}</Row>
          {req.note && <Row label="Ghi chú">{req.note}</Row>}
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-600">IDs liên quan</div>
            <div className="text-xs text-gray-800 mt-1">
              courseId: <b>{req.courseId || "—"}</b><br />
              contentId: <b>{req.courseContentId || "—"}</b><br />
              lessonId: <b>{req.lessonId || "—"}</b>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Link
            to={req.scope === "lesson"
              ? `/i/courses/${req.courseId}/lessons`
              : `/i/courses/${req.courseId}/edit`
            }
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> Mở trang liên quan
          </Link>
          <button
            onClick={() => onCancel(req)}
            className={`rounded-lg border px-3 py-2 text-sm inline-flex items-center gap-1 ${
              req.status === "pending" ? "hover:bg-gray-50" : "text-gray-400 border-gray-200 cursor-not-allowed"
            }`}
          >
            <XCircle className="w-4 h-4" /> Huỷ yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, className = "" }) {
  return (
    <div className={`grid grid-cols-[140px_1fr] gap-3 items-start ${className}`}>
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800">{children}</div>
    </div>
  );
}

function countBy(items, status, courseId) {
  return items.filter((x) => (!courseId || x.courseId === courseId) && x.status === status).length;
}
