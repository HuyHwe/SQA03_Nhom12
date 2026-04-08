// src/pages/student/StudentReviews.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Star, StarHalf, StarOff, Search, Filter, ArrowUpDown, Pencil, Check, X, Plus,
  ChevronLeft, ChevronRight, Clock3, Save, Trash2
} from "lucide-react";

/** (Tuỳ chọn) API base khi backend sẵn sàng */
// const API_BASE = "http://localhost:5102";

/** Mock: các review do chính học viên đã gửi (gộp nhiều khoá) */
const MOCK_MY_REVIEWS = [
  {
    reviewId: "r-1001",
    courseId: "react-18-pro",
    courseTitle: "React 18 Pro — Hooks, Router, Performance",
    rating: 5,
    content: "Khoá học cực kỳ hữu ích. Ví dụ rõ ràng, phần tối ưu hiệu năng rất thực tế.",
    createdAt: "2025-11-03T21:05:40.4203112",
    updatedAt: "2025-11-03T21:05:40.4203112",
  },
  {
    reviewId: "r-1002",
    courseId: "node-api",
    courseTitle: "Node.js RESTful API căn bản",
    rating: 4,
    content: "Phần REST cơ bản dễ hiểu. Nếu có thêm phần bảo mật JWT nâng cao thì tuyệt.",
    createdAt: "2025-10-29T09:12:10.0021001",
    updatedAt: "2025-11-02T18:01:01.0000000",
  },
];

/** Mock: các khóa đã học nhưng CHƯA có review -> cho phép tạo mới */
const MOCK_COMPLETED_NO_REVIEW = [
  {
    courseId: "sql-practical",
    courseTitle: "SQL Practical for Dev",
    finishedAt: "2025-10-25T08:10:10.0000000",
  },
];

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

const PAGE_SIZE = 8;

export default function StudentReviews() {
  useEffect(() => window.scrollTo(0, 0), []);

  // data state
  const [rows, setRows] = useState(MOCK_MY_REVIEWS);
  const [canCreateFor, setCanCreateFor] = useState(MOCK_COMPLETED_NO_REVIEW);

  // ui state
  const [q, setQ] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // all | 5 | 4 | 3 | 2 | 1
  const [sortBy, setSortBy] = useState("recent"); // recent | rating_desc | rating_asc
  const [page, setPage] = useState(1);

  // edit/create state
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ rating: 0, content: "" });

  const [creatingCourse, setCreatingCourse] = useState(null);
  const [createDraft, setCreateDraft] = useState({ rating: 0, content: "" });

  // ===== derived =====
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    let arr = rows.filter((r) => {
      const okQ = !k || r.courseTitle.toLowerCase().includes(k) || r.content.toLowerCase().includes(k);
      const okRating = ratingFilter === "all" ? true : r.rating === Number(ratingFilter);
      return okQ && okRating;
    });

    arr = arr.sort((a, b) => {
      if (sortBy === "rating_desc") return b.rating - a.rating;
      if (sortBy === "rating_asc") return a.rating - b.rating;
      return (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "");
    });

    return arr;
  }, [rows, q, ratingFilter, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [q, ratingFilter, sortBy]);

  // ===== actions (mock) =====
  const startEdit = (r) => {
    setEditingId(r.reviewId);
    setDraft({ rating: r.rating, content: r.content });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ rating: 0, content: "" });
  };
  const saveEdit = () => {
    if (!validate(draft)) return;
    setRows((arr) =>
      arr.map((r) =>
        r.reviewId === editingId
          ? { ...r, rating: draft.rating, content: draft.content.trim(), updatedAt: new Date().toISOString() }
          : r
      )
    );
    cancelEdit();
    // TODO: PATCH /api/{courseId}/reviews/{reviewId}
  };
  const removeReview = (r) => {
    if (!confirm("Xoá đánh giá này?")) return;
    setRows((arr) => arr.filter((x) => x.reviewId !== r.reviewId));
    // (Optional) cho phép đánh giá lại -> thêm vào danh sách có thể tạo
    setCanCreateFor((arr) => {
      if (arr.find((x) => x.courseId === r.courseId)) return arr;
      return [...arr, { courseId: r.courseId, courseTitle: r.courseTitle, finishedAt: r.updatedAt || r.createdAt }];
    });
    // TODO: (tuỳ API) DELETE hoặc đặt trạng thái
  };

  const startCreate = (course) => {
    setCreatingCourse(course);
    setCreateDraft({ rating: 0, content: "" });
  };
  const cancelCreate = () => {
    setCreatingCourse(null);
    setCreateDraft({ rating: 0, content: "" });
  };
  const submitCreate = () => {
    if (!validate(createDraft)) return;
    const newItem = {
      reviewId: `r-${Date.now()}`,
      courseId: creatingCourse.courseId,
      courseTitle: creatingCourse.courseTitle,
      rating: createDraft.rating,
      content: createDraft.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRows((arr) => [newItem, ...arr]);
    setCanCreateFor((arr) => arr.filter((c) => c.courseId !== creatingCourse.courseId));
    cancelCreate();
    // TODO: POST /api/{courseId}/reviews
  };

  const exportCSV = () => {
    const csv = [
      ["reviewId", "courseId", "courseTitle", "rating", "content", "createdAt", "updatedAt"],
      ...filtered.map((r) => [r.reviewId, r.courseId, r.courseTitle, r.rating, r.content, r.createdAt, r.updatedAt]),
    ]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_reviews.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== UI =====
  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">⭐ Đánh giá của tôi</h1>
            <p className="text-gray-600">Xem, chỉnh sửa hoặc gửi đánh giá cho các khóa đã học</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Export CSV
            </button>
            <Link
              to="/s/enrollments"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Về khóa học của tôi
            </Link>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        {/* New review for completed courses (no review yet) */}
        {canCreateFor.length > 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Gửi đánh giá mới</h2>
              <span className="text-xs text-gray-500">
                {canCreateFor.length} khoá chưa có đánh giá
              </span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {canCreateFor.map((c) => (
                <div key={c.courseId} className="rounded-xl border p-4">
                  <div className="font-medium text-gray-900">{c.courseTitle}</div>
                  <div className="text-xs text-gray-600 inline-flex items-center gap-1 mt-0.5">
                    <Clock3 className="w-3.5 h-3.5" /> Hoàn thành: {fmtDate(c.finishedAt)}
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => startCreate(c)}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Viết đánh giá
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* create editor */}
            {creatingCourse && (
              <div className="mt-4 rounded-xl border p-4 bg-gray-50">
                <div className="text-sm text-gray-800">
                  Viết đánh giá cho: <b>{creatingCourse.courseTitle}</b>
                </div>
                <div className="mt-3 grid gap-3">
                  <StarInput
                    value={createDraft.rating}
                    onChange={(v) => setCreateDraft((d) => ({ ...d, rating: v }))}
                  />
                  <textarea
                    value={createDraft.content}
                    onChange={(e) => setCreateDraft((d) => ({ ...d, content: e.target.value }))}
                    rows={4}
                    placeholder="Chia sẻ cảm nhận sau khi hoàn thành khoá… (tối thiểu 10 ký tự)"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{createDraft.content.length} / 1000</span>
                    <div className="flex gap-2">
                      <button
                        onClick={submitCreate}
                        className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-gray-100 inline-flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Gửi
                      </button>
                      <button
                        onClick={cancelCreate}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-[44%]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên khóa học hoặc nội dung…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Tất cả sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>

            <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="recent">Mới cập nhật</option>
              <option value="rating_desc">Sao ↓</option>
              <option value="rating_asc">Sao ↑</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {view.length === 0 && (
            <div className="col-span-full text-center text-gray-600 border rounded-2xl p-10">
              Chưa có đánh giá nào khớp bộ lọc hiện tại.
            </div>
          )}

          {view.map((r) => {
            const editing = editingId === r.reviewId;
            return (
              <article key={r.reviewId} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/courses/${r.courseId}`}
                      className="font-bold text-gray-900 hover:underline line-clamp-2"
                    >
                      {r.courseTitle}
                    </Link>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Tạo: {fmtDate(r.createdAt)} • Cập nhật: {fmtDate(r.updatedAt)}
                    </div>
                  </div>

                  {!editing ? (
                    <button
                      onClick={() => startEdit(r)}
                      className="rounded-lg border px-2.5 py-1.5 hover:bg-gray-50 inline-flex items-center gap-1 text-sm shrink-0"
                      title="Sửa đánh giá"
                    >
                      <Pencil className="w-4 h-4" /> Sửa
                    </button>
                  ) : null}
                </div>

                {/* rating + content */}
                {!editing ? (
                  <>
                    <div className="mt-3"><StarStatic value={r.rating} /></div>
                    <p className="mt-2 text-gray-800 text-sm whitespace-pre-wrap">{r.content}</p>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Link
                        to={`/courses/${r.courseId}`}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Xem khoá
                      </Link>
                      <button
                        onClick={() => removeReview(r)}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1 text-rose-700 border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" /> Xoá
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 grid gap-3">
                    <StarInput
                      value={draft.rating}
                      onChange={(v) => setDraft((d) => ({ ...d, rating: v }))}
                    />
                    <textarea
                      value={draft.content}
                      onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                      rows={5}
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Chỉnh sửa nội dung đánh giá… (tối thiểu 10 ký tự)"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{draft.content.length} / 1000</span>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="rounded-lg border px-3 py-1.5 text-sm bg-white hover:bg-gray-100 inline-flex items-center gap-2 text-emerald-700 border-emerald-200"
                        >
                          <Check className="w-4 h-4" /> Lưu
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white inline-flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Huỷ
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đánh giá
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
      </main>

      <Footer />
    </div>
  );
}

/* ===== rating widgets ===== */
function StarStatic({ value = 0 }) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        if (value >= n) return <Star key={n} className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
        if (value > n - 1 && value < n) return <StarHalf key={n} className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
        return <StarOff key={n} className="w-4 h-4 text-gray-300" />;
      })}
      <span className="text-xs text-gray-700 ml-1">{value}/5</span>
    </div>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5"
            title={`${n} sao`}
          >
            {value >= n ? (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="w-5 h-5 text-gray-300 hover:text-yellow-500" />
            )}
          </button>
        );
      })}
      <span className="text-xs text-gray-600 ml-1">{value ? `${value}/5` : "Chọn số sao"}</span>
    </div>
  );
}

/* ===== validation ===== */
function validate({ rating, content }) {
  if (!rating || rating < 1 || rating > 5) {
    alert("Vui lòng chọn số sao (1–5).");
    return false;
  }
  const t = (content || "").trim();
  if (t.length < 10) {
    alert("Nội dung tối thiểu 10 ký tự.");
    return false;
  }
  if (t.length > 1000) {
    alert("Nội dung tối đa 1000 ký tự.");
    return false;
  }
  return true;
}
