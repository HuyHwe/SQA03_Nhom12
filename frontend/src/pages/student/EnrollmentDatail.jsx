// src/pages/student/EnrollmentDetail.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Loader2, AlertCircle, Gauge, BookOpen, Timer, CalendarDays,
  CheckCircle2, CircleDot, ExternalLink, Download, BarChart3
} from "lucide-react";

/** Cấu hình API */
const API_BASE = "http://localhost:5102";

/** Helpers date theo format ISO từ API */
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", { hour12: false });
};

/** Local fallback (phòng API chưa có endpoint detail) */
function getLocalEnrollment(courseId) {
  try {
    const raw = localStorage.getItem("my_enrollments");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.find((x) => x.courseId === courseId) || null;
  } catch {
    return null;
  }
}

const badgeByStatus = (s) =>
  s === "completed"
    ? "bg-indigo-100 text-indigo-700"
    : s === "paused"
    ? "bg-amber-100 text-amber-700"
    : s === "refunded"
    ? "bg-rose-100 text-rose-700"
    : "bg-emerald-100 text-emerald-700"; // active (mặc định)

const typeLabel = (t) =>
  t === "video" ? "Video" : t === "reading" ? "Tài liệu" : t === "quiz" ? "Quiz" : (t || "Bài học");

const ProgressBar = ({ value = 0 }) => {
  const pct = Math.max(0, Math.min(100, Number(value)));
  return (
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default function EnrollmentDetail() {
  /** Route:
   *  gợi ý dùng: /s/enrollments/:courseId/:enrollmentId?
   *  - nếu có enrollmentId → gọi GET /api/courses/{courseId}/enrollments/{enrollmentId}
   *  - nếu không → gọi GET /api/courses/{courseId}/enrollments và lấy bản của “current user”
   *  - nếu cả hai cùng không có API → fallback localStorage
   */
  const { courseId, enrollmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [view, setView] = useState(null); // dữ liệu đã chuẩn hoá cho UI

  // tải dữ liệu
  useEffect(() => {
    let ignore = false;
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setErr("");
      try {
        // Ưu tiên endpoint chi tiết (nếu có enrollmentId)
        if (enrollmentId) {
          const res = await fetch(
            `${API_BASE}/api/courses/${courseId}/enrollments/${enrollmentId}`,
            { signal: ac.signal }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (!ignore) setView(normalizeDetail(courseId, data));
          setLoading(false);
          return;
        }

        // Thử danh sách enrollment của course rồi tự chọn record “current user”
        const resList = await fetch(
          `${API_BASE}/api/courses/${courseId}/enrollments`,
          { signal: ac.signal }
        );
        if (resList.ok) {
          const arr = await resList.json();
          const first = Array.isArray(arr) && arr.length ? arr[0] : null;
          if (first && !ignore) {
            setView(normalizeDetail(courseId, first));
            setLoading(false);
            return;
          }
        }

        // Fallback local
        const local = getLocalEnrollment(courseId);
        if (local) {
          if (!ignore) {
            setView({
              courseId,
              courseTitle: local.title,
              categoryName: local.categoryName || "—",
              thumbnailUrl: local.thumbnailUrl || null,
              status: "active",
              progress: Number(local.progress || 0),
              lessonsDone: null,
              lessonsTotal: null,
              timeSpentMinutes: null,
              startedAt: null,
              lastActive: local.lastAccessISO || null,
              attempts: [],
              timeline: [],
            });
          }
        } else {
          throw new Error("NO_DATA");
        }
      } catch (e) {
        if (!ignore) setErr("Không tải được chi tiết ghi danh. Có thể API chưa sẵn sàng hoặc không tìm thấy bản ghi.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
      ac.abort();
    };
  }, [courseId, enrollmentId]);

  const kpis = useMemo(() => {
    if (!view) return null;
    const timeSpent = view.timeSpentMinutes != null
      ? `${Math.floor(view.timeSpentMinutes / 60)}h ${view.timeSpentMinutes % 60}m`
      : "—";
    return [
      { icon: <Gauge className="w-4 h-4" />, label: "Tiến độ", value: `${view.progress ?? 0}%`, extra: <Radial pct={view.progress ?? 0} /> },
      { icon: <BookOpen className="w-4 h-4" />, label: "Bài đã học", value: view.lessonsDone != null && view.lessonsTotal != null ? `${view.lessonsDone}/${view.lessonsTotal}` : "—" },
      { icon: <BarChart3 className="w-4 h-4" />, label: "Lượt làm bài", value: view.attempts?.length ?? 0 },
      { icon: <Timer className="w-4 h-4" />, label: "Thời gian học", value: timeSpent },
    ];
  }, [view]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen max-w-none bg-white">
        <Header />
        <main className="w-full px-6 lg:px-12 py-16">
          <div className="rounded-2xl border bg-white p-6 text-gray-700 inline-flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải chi tiết ghi danh…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="min-h-screen w-screen max-w-none bg-white">
        <Header />
        <main className="w-full px-6 lg:px-12 py-16">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 inline-flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {err || "Không có dữ liệu ghi danh."}
          </div>
          <div className="mt-6">
            <Link to="/s/enrollments" className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Về “Khoá học của tôi”
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border px-3 py-1.5 hover:bg-white/60 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="flex items-center gap-3">
              <div className="w-24 h-14 bg-gray-100 rounded-lg overflow-hidden">
                {view.thumbnailUrl ? (
                  <img src={view.thumbnailUrl} alt={view.courseTitle} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 line-clamp-2">
                  {view.courseTitle}
                </h1>
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full ${badgeByStatus(view.status)}`}>
                    {view.status || "active"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" /> Bắt đầu: {fmtDate(view.startedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="w-4 h-4" /> Hoạt động gần nhất: {fmtDate(view.lastActive)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/s/learning/${view.courseId}`}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
            >
              Tiếp tục học
            </Link>
            <Link
              to={`/courses/${view.courseId}`}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Trang khoá học
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-8">
        {/* LEFT: KPI + Timeline + Attempts */}
        <section className="space-y-8">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis?.map((k, i) => (
              <KPI key={i} icon={k.icon} label={k.label} value={k.value}>
                {k.extra}
              </KPI>
            ))}
          </div>

          {/* Thanh tiến độ tổng */}
          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Tiến độ học tập</h2>
              <div className="text-sm text-gray-700 font-semibold">{view.progress ?? 0}%</div>
            </div>
            <div className="mt-2"><ProgressBar value={view.progress ?? 0} /></div>
            {view.lessonsDone != null && view.lessonsTotal != null && (
              <div className="mt-2 text-xs text-gray-600">
                {view.lessonsDone}/{view.lessonsTotal} bài đã hoàn thành
              </div>
            )}
          </div>

          {/* Timeline các bài học */}
          <div className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">Nhật ký theo bài học</h2>
            <div className="mt-4">
              {(!view.timeline || view.timeline.length === 0) && (
                <div className="text-sm text-gray-600">Chưa có mốc nào. Hãy bắt đầu học bài đầu tiên nhé!</div>
              )}

              <ul className="relative">
                {view.timeline?.map((l, idx) => (
                  <li key={l.id || idx} className="pl-8 pb-5 last:pb-0 relative">
                    {/* line */}
                    {idx < view.timeline.length - 1 && (
                      <span className="absolute left-[11px] top-4 bottom-[-8px] w-[2px] bg-gray-200" />
                    )}
                    {/* dot */}
                    <span
                      className={`absolute left-0 top-1.5 w-5 h-5 rounded-full grid place-items-center
                      ${l.doneAt ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {l.doneAt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
                    </span>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{l.title}</div>
                        <div className="text-xs text-gray-600">
                          Loại: {typeLabel(l.type)} {l.duration ? `• ${l.duration}` : ""}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {l.doneAt ? `Hoàn thành ${fmtDate(l.doneAt)}` : "Chưa hoàn thành"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Attempts (nếu có thi/quiz) */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Lượt làm bài kiểm tra</h2>
              {view.attempts?.length ? (
                <button
                  onClick={() => exportAttemptsCSV(courseId, enrollmentId, view.attempts)}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              ) : null}
            </div>

            {(!view.attempts || view.attempts.length === 0) ? (
              <div className="px-5 py-6 text-sm text-gray-600">Chưa có lượt làm nào.</div>
            ) : (
              <>
                <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
                  <div className="col-span-5">Đề thi</div>
                  <div className="col-span-2">Thời gian</div>
                  <div className="col-span-2 text-center">Điểm</div>
                  <div className="col-span-1 text-center">Trạng thái</div>
                  <div className="col-span-2 text-right">Xem</div>
                </div>
                {view.attempts.map((a, i) => (
                  <div key={a.id || i} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                    <div className="col-span-5">
                      <div className="font-medium text-gray-900">{a.examTitle || "—"}</div>
                      <div className="text-xs text-gray-600">{fmtDate(a.date)} • {a.duration || "—"}</div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">{fmtDate(a.date)}</div>
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-semibold ${Number(a.scorePct) >= 70 ? "text-emerald-700" : "text-amber-700"}`}>
                        {a.scorePct != null ? `${a.scorePct}%` : "—"}
                      </span>
                    </div>
                    <div className="col-span-1 text-center text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{a.status || "graded"}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/s/results/${a.id || i}`}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                        >
                          Chi tiết <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* RIGHT: thông tin khoá + lối tắt */}
        <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900">Thông tin khoá</h3>
            <div className="mt-2 text-sm text-gray-700">
              <div>Danh mục: <b>{view.categoryName || "—"}</b></div>
              <div>Bắt đầu: <b>{fmtDate(view.startedAt)}</b></div>
              <div>Gần nhất: <b>{fmtDate(view.lastActive)}</b></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to={`/s/learning/${view.courseId}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 text-center">
                Vào trình học
              </Link>
              <Link to={`/courses/${view.courseId}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 text-center">
                Trang public
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900">Hỗ trợ</h3>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li>• Nếu tiến độ không cập nhật, thử tải lại trang.</li>
              <li>• Kiểm tra kết nối mạng để đồng bộ.</li>
              <li>• Liên hệ giảng viên khi gặp lỗi bài thi.</li>
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* ====== UI pieces ====== */
function KPI({ icon, label, value, children }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs text-gray-600 flex items-center gap-2">{icon}{label}</div>
      <div className="mt-1 flex items-end justify-between">
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        {children}
      </div>
    </div>
  );
}

function Radial({ pct = 0 }) {
  const v = Math.max(0, Math.min(100, Number(pct)));
  return (
    <div
      className="w-12 h-12 rounded-full grid place-items-center text-sm font-bold"
      style={{ background: `conic-gradient(#2563eb ${v * 3.6}deg, #e5e7eb 0)` }}
      title={`${v}%`}
    >
      <span className="bg-white w-8 h-8 rounded-full grid place-items-center shadow-inner">{v}%</span>
    </div>
  );
}

/* ====== Normalize API → UI ======
   Vì API enrollment detail chưa có spec, ta chuẩn hoá mềm, đọc an toàn các field thường gặp.
*/
function normalizeDetail(courseId, raw) {
  // dự đoán cấu trúc phổ biến
  const course = raw.course || {}; // nếu API lồng course
  const attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
  const timeline = Array.isArray(raw.timeline) ? raw.timeline : (Array.isArray(raw.lessons) ? raw.lessons : []);

  return {
    courseId: courseId || raw.courseId || course.id,
    courseTitle: raw.courseTitle || course.title || "—",
    categoryName: raw.categoryName || course.categoryName || "—",
    thumbnailUrl: raw.thumbnailUrl || course.thumbnailUrl || null,

    status: raw.status || "active",
    progress: Number(raw.progress ?? raw.progressPct ?? 0),
    lessonsDone: raw.lessonsDone ?? null,
    lessonsTotal: raw.lessonsTotal ?? null,
    timeSpentMinutes: raw.timeSpentMinutes ?? raw.timeSpent ?? null,

    startedAt: raw.startedAt || raw.enrolledAt || null,
    lastActive: raw.lastActive || raw.updatedAt || raw.createdAt || null,

    attempts: attempts.map((a) => ({
      id: a.id,
      examTitle: a.examTitle || a.title,
      date: a.date || a.startedAt || a.submittedAt,
      duration: a.duration || a.durationLabel,
      scorePct: a.scorePct ?? a.score ?? null,
      status: a.status || "graded",
    })),

    timeline: timeline.map((l, i) => ({
      id: l.id || i,
      title: l.title || "Bài học",
      type: l.type || l.kind || "video",
      duration: l.duration || l.durationLabel || "",
      doneAt: l.doneAt || l.completedAt || null,
    })),
  };
}

/** Xuất CSV attempts (nếu có) */
function exportAttemptsCSV(courseId, enrollmentId, attempts = []) {
  const rows = [
    ["attemptId", "examTitle", "date", "duration", "scorePct", "status"],
    ...attempts.map((a) => [
      a.id ?? "",
      a.examTitle ?? "",
      a.date ?? "",
      a.duration ?? "",
      a.scorePct ?? "",
      a.status ?? "",
    ]),
  ]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enrollment_${courseId}_${enrollmentId || "me"}_attempts.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
