// src/pages/DiscussionDetail.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getDiscussionThreads } from "../api/mock";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Tag as TagIcon,
  User,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";

/* ===== Theme ===== */
const BRAND = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
};

/* ===== Helpers ===== */
const Section = ({ id, title, subtitle, action, children, className = "" }) => (
  <section id={id} className={`w-screen overflow-x-hidden py-8 lg:py-12 ${className}`}>
    <div className="w-screen px-6 lg:px-12">
      {(title || subtitle || action) && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {title && <h1 className="text-2xl lg:text-3xl font-extrabold">{title}</h1>}
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
    className={"rounded-full text-white px-5 py-2.5 transition " + className}
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
    className={"rounded-full border px-5 py-2.5 transition " + className}
    style={{ borderColor: BRAND.primary, color: BRAND.primary }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    {...props}
  >
    {children}
  </button>
);

/* ===== Reply Item ===== */
function ReplyItem({ r }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 grid place-items-center text-slate-500">
          <User size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="truncate">
              <div className="font-semibold truncate">{r.author || "Thành viên"}</div>
              <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            <button
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
              type="button"
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {open ? "Thu gọn" : "Mở rộng"}
            </button>
          </div>

          {open && (
            <div className="mt-3 text-slate-800 whitespace-pre-wrap break-words">
              {r.content}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            <button className="inline-flex items-center gap-1 hover:text-slate-900" type="button">
              <ThumbsUp size={16} /> Hữu ích
            </button>
            <button className="inline-flex items-center gap-1 hover:text-slate-900" type="button">
              <Share2 size={16} /> Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Detail Page ===== */
export default function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [replies, setReplies] = useState([]);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");

  // load all threads (dùng chung với page list) rồi find theo id
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getDiscussionThreads();
        if (!alive) return;
        setThreads(data ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const thread = useMemo(() => {
    const t = (threads ?? []).find((x) => String(x.id) === String(id));
    return t
      ? {
          id: t.id,
          title: t.title ?? "Chủ đề chưa đặt tên",
          author: t.author ?? "Ẩn danh",
          replies: Number.isFinite(t.replies) ? t.replies : 0,
          lastReplyAt: t.lastReplyAt ?? new Date().toISOString(),
          category: t.category ?? "Khác",
          tags: Array.isArray(t.tags) ? t.tags : [],
          excerpt: t.excerpt ?? "",
          body:
            t.body ??
            t.excerpt ??
            "Chưa có nội dung chi tiết. Bạn có thể cập nhật nội dung ở mock API hoặc nhập trực tiếp khi triển khai backend.",
        }
      : null;
  }, [threads, id]);

  useEffect(() => {
    if (!loading) setNotFound(!thread);
  }, [loading, thread]);

  // seed replies (mock local) để không phụ thuộc API khác
  useEffect(() => {
    if (!thread) return;
    // tạo vài reply giả nếu chưa có
    setReplies((prev) => {
      if (prev.length) return prev;
      const seedN = Math.min(3, thread.replies || 0);
      return Array.from({ length: seedN }).map((_, i) => ({
        id: `r_${i}_${thread.id}`,
        author: i === 0 ? "Học viên A" : i === 1 ? "Mentor B" : "Member C",
        createdAt: new Date(Date.now() - (seedN - i) * 60 * 60 * 1000).toISOString(),
        content:
          i === 0
            ? "Mình gặp lỗi giống bạn ở phần cấu hình môi trường. Cần kiểm tra phiên bản Node và biến môi trường nữa nhé."
            : i === 1
            ? "Gợi ý: chia nhỏ vấn đề, log từng bước và đính kèm snippet code tối thiểu có thể chạy (MCVE)."
            : "Cảm ơn mọi người, mình thử theo hướng dẫn và đã fix được. Upvote cho câu trả lời số 2!",
      }));
    });
  }, [thread]);

  const fmtTime = (iso) => {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return "—";
    }
  };

  const related = useMemo(() => {
    if (!thread) return [];
    // lấy tối đa 6 bài liên quan cùng category, khác id hiện tại
    return (threads ?? [])
      .filter((t) => t.id !== thread.id && (t.category ?? "Khác") === (thread.category ?? "Khác"))
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        title: t.title ?? "Chủ đề",
        replies: Number.isFinite(t.replies) ? t.replies : 0,
        lastReplyAt: t.lastReplyAt ?? new Date().toISOString(),
      }));
  }, [threads, thread]);

  const popularTags = useMemo(() => {
    const map = new Map();
    (threads ?? []).forEach((t) => {
      (t.tags ?? []).forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [threads]);

  const handleReply = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const r = {
      id: "r_" + Date.now(),
      author: name.trim() || "Ẩn danh",
      createdAt: new Date().toISOString(),
      content: content.trim(),
    };
    setReplies((arr) => [r, ...arr]);
    setContent("");
    setName("");
    // tăng counter tạm thời cho UI
    // (nếu có backend, call API rồi refetch)
    const idx = threads.findIndex((x) => String(x.id) === String(id));
    if (idx > -1) {
      const next = [...threads];
      next[idx] = {
        ...next[idx],
        replies: (Number.isFinite(next[idx].replies) ? next[idx].replies : 0) + 1,
        lastReplyAt: new Date().toISOString(),
      };
      setThreads(next);
    }
    // scroll to replies
    setTimeout(() => {
      document.getElementById("replies")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Section>
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-1/2 bg-slate-200 rounded" />
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-48 w-full bg-slate-200 rounded" />
          </div>
        </Section>
        <Footer />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header />
        <Section
          title="Không tìm thấy chủ đề"
          subtitle="Có thể chủ đề đã bị xóa hoặc ID không tồn tại."
          action={<Ghost onClick={() => navigate("/discussion")}><ArrowLeft size={16} /> Quay lại danh sách</Ghost>}
        >
          <div className="rounded-2xl border bg-white p-6">
            Kiểm tra lại đường dẫn hoặc quay lại trang Thảo luận.
          </div>
        </Section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* BREADCRUMB + ACTIONS */}
      <Section
        title={thread.title}
        subtitle={
          <span className="inline-flex items-center gap-3 text-sm">
            <span className="text-slate-700">Bởi <span className="font-medium">{thread.author}</span></span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <MessageSquare size={16} /> {thread.replies} phản hồi
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Clock size={16} /> {fmtTime(thread.lastReplyAt)}
            </span>
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Ghost onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</Ghost>
            <Primary onClick={() => document.getElementById("reply-form")?.scrollIntoView({ behavior: "smooth" })}>
              Trả lời
            </Primary>
          </div>
        }
      >
        {/* Chip danh mục + tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
            style={{ borderColor: "#e5e7eb" }}
          >
            <TagIcon size={14} /> {thread.category}
          </span>
          {(thread.tags ?? []).map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-50" style={{ border: "1px solid #e5e7eb" }}>
              #{tag}
            </span>
          ))}
        </div>
      </Section>

      {/* MAIN GRID */}
      <section className="w-screen overflow-x-hidden">
        <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[3fr_1.2fr] gap-8">
          {/* Content */}
          <div>
            {/* Body */}
            <article className="rounded-2xl border bg-white p-6">
              <div className="prose max-w-none prose-p:leading-relaxed prose-headings:mt-4 prose-headings:mb-2">
                <p className="text-slate-800 whitespace-pre-wrap">{thread.body}</p>
              </div>
            </article>

            {/* Replies */}
            <div id="replies" className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg">Phản hồi ({replies.length})</h3>
              {replies.map((r) => (
                <ReplyItem key={r.id} r={r} />
              ))}
              {replies.length === 0 && (
                <div className="rounded-2xl border bg-white p-6 text-slate-600">
                  Chưa có phản hồi nào. Hãy là người đầu tiên tham gia thảo luận!
                </div>
              )}
            </div>

            {/* Reply form */}
            <div id="reply-form" className="mt-6 rounded-2xl border bg-white p-6">
              <h4 className="font-semibold mb-3">Viết phản hồi</h4>
              <form onSubmit={handleReply} className="grid gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên của bạn (tuỳ chọn)"
                  className="w-full rounded-full border px-4 py-2 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nội dung phản hồi…"
                  rows={4}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                  required
                />
                <div className="flex items-center gap-2">
                  <Primary type="submit">Gửi phản hồi</Primary>
                  <Ghost type="button" onClick={() => setContent("")}>
                    Xoá nội dung
                  </Ghost>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar (sticky) */}
          <aside className="space-y-4 lg:sticky lg:top-20 h-fit">
            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-2">Tham gia nhanh</h4>
              <p className="text-sm text-slate-600">
                Đăng nhập để theo dõi chủ đề, nhận thông báo khi có phản hồi mới.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link to="/login">
                  <Primary>Đăng nhập</Primary>
                </Link>
                <Link to="/register">
                  <Ghost>Đăng ký</Ghost>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-3">Chủ đề liên quan</h4>
              <ul className="space-y-3">
                {related.length === 0 && <li className="text-sm text-slate-600">Chưa có gợi ý.</li>}
                {related.map((r) => (
                  <li key={r.id} className="border rounded-xl p-3 hover:shadow-sm">
                    <Link to={`/discussion/${r.id}`} className="font-medium line-clamp-2 hover:underline">
                      {r.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-600 flex items-center gap-2">
                      <MessageSquare size={14} /> {r.replies}
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} /> {new Date(r.lastReplyAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <h4 className="font-semibold mb-3">Thẻ phổ biến</h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.length === 0 && <span className="text-sm text-slate-600">Chưa có thẻ</span>}
                {popularTags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "#e5e7eb" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
