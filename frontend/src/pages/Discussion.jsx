// src/pages/Discussion.jsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getDiscussionThreads } from "../api/mock";
import { Search, MessageSquare, Clock, Tag as TagIcon, ChevronLeft, ChevronRight } from "lucide-react";

/* ===== Theme (đồng bộ) ===== */
const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
};

/* ===== Full-bleed Section helper ===== */
const Section = ({ id, title, subtitle, action, children, className = "" }) => (
  <section id={id} className={`w-screen overflow-x-hidden py-10 lg:py-14 ${className}`}>
    <div className="w-screen px-6 lg:px-12">
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-2xl lg:text-3xl font-extrabold">{title}</h2>}
            {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
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
    className={
      "rounded-full text-white px-5 py-2.5 transition " +
      className
    }
    style={{ backgroundColor: BRAND.primary }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.primaryHover)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.primary)}
    {...props}
  >
    {children}
  </button>
);

const Ghost = ({ children, className = "", ...props }) => (
  <button
    className={
      "rounded-full border px-5 py-2.5 transition " + className
    }
    style={{ borderColor: BRAND.primary, color: BRAND.primary }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    {...props}
  >
    {children}
  </button>
);

/* ===== Page ===== */
export default function Discussion() {
  /* ---- data ---- */
  const [raw, setRaw] = useState([]);          // dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("latest"); // latest | mostReplies | oldest
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { register, handleSubmit, reset } = useForm();

  // Tabs chủ đề (mặc định). Nếu mock trả category khác sẽ tự thêm.
  const DEFAULT_TABS = useMemo(
    () => ["Tất cả", "Hỏi đáp kỹ thuật", "Chia sẻ tài nguyên", "Học tập & Lộ trình", "Sự kiện", "Khác"],
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getDiscussionThreads(); // kỳ vọng: [{id,title,author,replies,lastReplyAt,category,tags[]}, ...]
        if (!alive) return;
        // Chuẩn hóa tối thiểu, KHÔNG làm mất dữ liệu
        const normalized = (data ?? []).map((t, idx) => ({
          id: t.id ?? `t_${idx}_${Date.now()}`,
          title: t.title ?? "Chủ đề chưa đặt tên",
          author: t.author ?? "Ẩn danh",
          replies: Number.isFinite(t.replies) ? t.replies : 0,
          lastReplyAt: t.lastReplyAt ?? new Date().toISOString(),
          category: t.category ?? "Khác",
          tags: Array.isArray(t.tags) ? t.tags : [],
          excerpt: t.excerpt ?? "",
        }));
        setRaw(normalized);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---- actions ---- */
  const onCreate = (data) => {
    const t = {
      id: "t_" + Date.now(),
      title: data.title,
      author: data.author?.trim() || "Ẩn danh",
      replies: 0,
      lastReplyAt: new Date().toISOString(),
      category: data.category || "Khác",
      tags: data.tags ? data.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      excerpt: data.excerpt || "",
    };
    setRaw((arr) => [t, ...arr]);
    reset();
    setSelectedTab("Tất cả");
    setQ("");
    setPage(1);
  };

  const categories = useMemo(() => {
    const set = new Set(DEFAULT_TABS);
    raw.forEach(t => set.add(t.category ?? "Khác"));
    return Array.from(set);
  }, [raw, DEFAULT_TABS]);

  /* ---- derived: filter + search + sort + paginate ---- */
  const filtered = useMemo(() => {
    let list = raw;
    if (selectedTab !== "Tất cả") {
      list = list.filter(t => (t.category ?? "Khác") === selectedTab);
    }
    if (q.trim()) {
      const k = q.toLowerCase().trim();
      list = list.filter(t =>
        (t.title ?? "").toLowerCase().includes(k) ||
        (t.author ?? "").toLowerCase().includes(k) ||
        (t.excerpt ?? "").toLowerCase().includes(k) ||
        (t.tags ?? []).some(tag => tag.toLowerCase().includes(k))
      );
    }
    switch (sortBy) {
      case "mostReplies":
        list = [...list].sort((a, b) => (b.replies ?? 0) - (a.replies ?? 0));
        break;
      case "oldest":
        list = [...list].sort(
          (a, b) => new Date(a.lastReplyAt ?? 0) - new Date(b.lastReplyAt ?? 0)
        );
        break;
      case "latest":
      default:
        list = [...list].sort(
          (a, b) => new Date(b.lastReplyAt ?? 0) - new Date(a.lastReplyAt ?? 0)
        );
        break;
    }
    return list;
  }, [raw, selectedTab, q, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const goPage = (p) => {
    const np = Math.max(1, Math.min(totalPages, p));
    setPage(np);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- small helpers ---- */
  const fmtTime = (iso) => {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return "—";
    }
  };

  const totalReplies = useMemo(() => raw.reduce((s, t) => s + (t.replies ?? 0), 0), [raw]);

  // focus search khi bấm /
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Header />

      {/* HERO */}
      <Section
        id="hero"
        title="Diễn đàn thảo luận"
        subtitle="Đặt câu hỏi, chia sẻ kinh nghiệm và nhận hỗ trợ từ cộng đồng."
        action={
          <div className="flex items-center gap-2">
            <Ghost as="a" href="#new-thread">Tạo chủ đề</Ghost>
            <Primary onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
              Xem hoạt động
            </Primary>
          </div>
        }
      >
        {/* Controls: Tabs + Search + Sort */}
        <div className="grid gap-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setSelectedTab(c); setPage(1); }}
                className={`px-3 py-2 text-sm rounded-full border transition ${
                  selectedTab === c
                    ? "text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                style={
                  selectedTab === c
                    ? { backgroundColor: BRAND.primary, borderColor: BRAND.primary }
                    : { borderColor: "#e5e7eb" }
                }
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Tìm chủ đề (nhấn / để focus)…"
                className="w-full rounded-full border px-5 py-3 pr-11 outline-none focus:ring-2"
                style={{ borderColor: "#e5e7eb" }}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={18} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="rounded-full border px-4 py-2 text-sm outline-none"
                style={{ borderColor: "#e5e7eb" }}
              >
                <option value="latest">Mới cập nhật</option>
                <option value="mostReplies">Nhiều phản hồi</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>
      </Section>

      {/* MAIN: content grid (3fr : 1.2fr) */}
      <section className="w-screen overflow-x-hidden">
        <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[3fr_1.2fr] gap-8">
          {/* LEFT: Thread list */}
          <div>
            {/* Counter */}
            <div className="mb-4 text-sm text-slate-600">
              {loading ? "Đang tải…" : `Có ${filtered.length} chủ đề, tổng ${totalReplies} phản hồi`}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
              {pageItems.map((t) => (
                <article key={t.id} className="rounded-2xl border bg-white p-5 hover:shadow transition">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-lg leading-tight">
                      <Link to={`/discussion/${t.id}`} className="hover:underline">
                        {t.title}
                      </Link>
                    </h3>

                    {/* Chips */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                            style={{ borderColor: "#e5e7eb" }}>
                        <TagIcon size={14} /> {t.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                            style={{ borderColor: "#e5e7eb" }}>
                        <MessageSquare size={14} /> {t.replies} phản hồi
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                            style={{ borderColor: "#e5e7eb" }}>
                        <Clock size={14} /> {fmtTime(t.lastReplyAt)}
                      </span>
                    </div>
                  </div>

                  {t.excerpt && (
                    <p className="text-slate-700 mt-2">{t.excerpt}</p>
                  )}

                  {/* Tags */}
                  {t.tags && t.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-slate-50"
                          style={{ border: "1px solid #e5e7eb" }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer line */}
                  <div className="mt-4 text-sm text-slate-600">
                    Bởi <span className="font-medium">{t.author}</span>
                  </div>
                </article>
              ))}

              {!loading && pageItems.length === 0 && (
                <div className="rounded-xl border bg-white p-8 text-center text-slate-600">
                  Không có chủ đề phù hợp bộ lọc hiện tại.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e5e7eb", color: "#334155" }}
                onClick={() => goPage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                // Hiển thị dải thông minh quanh trang hiện tại
                let start = Math.max(1, safePage - 2);
                let end = Math.min(totalPages, start + 6);
                start = Math.max(1, end - 6);
                const p = start + i;
                if (p > totalPages) return null;
                const active = p === safePage;
                return (
                  <button
                    key={`p-${p}`}
                    className={`px-3 py-2 rounded-lg text-sm ${active ? "text-white" : "border"}`}
                    style={active
                      ? { backgroundColor: BRAND.primary }
                      : { borderColor: "#e5e7eb", color: "#334155" }}
                    onClick={() => goPage(p)}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e5e7eb", color: "#334155" }}
                onClick={() => goPage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT: Sidebar (nhỏ, sticky) */}
          <aside className="space-y-4 lg:sticky lg:top-20 h-fit">
            {/* Create thread */}
            <div id="new-thread" className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold text-lg mb-3">Tạo chủ đề mới</h4>
              <form onSubmit={handleSubmit(onCreate)} className="grid gap-3">
                <input
                  className="w-full rounded-full border px-4 py-2 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  placeholder="Tiêu đề chủ đề"
                  {...register("title", { required: true })}
                />
                <input
                  className="w-full rounded-full border px-4 py-2 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  placeholder="Tên bạn (tuỳ chọn)"
                  {...register("author")}
                />
                <select
                  className="w-full rounded-full border px-4 py-2 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  {...register("category")}
                  defaultValue="Hỏi đáp kỹ thuật"
                >
                  {DEFAULT_TABS.filter((t) => t !== "Tất cả").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  className="w-full rounded-full border px-4 py-2 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  placeholder="Tags (ngăn cách bởi dấu phẩy)"
                  {...register("tags")}
                />
                <textarea
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  rows={3}
                  placeholder="Mô tả ngắn / vấn đề chính…"
                  {...register("excerpt")}
                />
                <Primary type="submit" className="justify-self-start">Đăng chủ đề</Primary>
              </form>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-3">Tổng quan</h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>Chủ đề: <span className="font-medium">{raw.length}</span></li>
                <li>Phản hồi: <span className="font-medium">{totalReplies}</span></li>
                <li>Danh mục: <span className="font-medium">{categories.length - 1}</span></li>
              </ul>
            </div>

            {/* Popular tags (auto từ data) */}
            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-3">Thẻ phổ biến</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  raw.reduce((map, t) => {
                    (t.tags ?? []).forEach(tag => map.set(tag, (map.get(tag) ?? 0) + 1));
                    return map;
                  }, new Map())
                )
                .sort((a,b) => b[1]-a[1])
                .slice(0, 12)
                .map(([tag, count]) => (
                  <button
                    key={tag}
                    type="button"
                    className="text-xs px-2 py-1 rounded-full border hover:bg-slate-50"
                    style={{ borderColor: "#e5e7eb" }}
                    onClick={() => { setQ(tag); setPage(1); }}
                    title={`${count} chủ đề`}
                  >
                    #{tag}
                  </button>
                ))}
                {raw.length === 0 && <span className="text-sm text-slate-500">Chưa có thẻ</span>}
              </div>
            </div>

            {/* Help box */}
            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-2">Quy tắc cộng đồng</h4>
              <p className="text-sm text-slate-600">
                Tôn trọng, rõ ràng, tránh spam. Nêu đủ ngữ cảnh khi hỏi và nhớ đánh dấu câu trả lời hay nhé!
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
