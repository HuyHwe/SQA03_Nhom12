// src/pages/student/EnrollCheckout.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Loader2, ShieldCheck, CreditCard, Wallet, CheckCircle2, AlertCircle,
  Tag, ReceiptText, LockKeyhole, Info
} from "lucide-react";

/* ====== Config ====== */
const API_BASE = "http://localhost:5102";

/* ====== Helpers ====== */
const NF = new Intl.NumberFormat("vi-VN");
const money = (v) => (typeof v === "number" ? `${NF.format(v)}đ` : "—");
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
};

export default function EnrollCheckout() {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();

  // course
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState("");

  // checkout
  const [method, setMethod] = useState("card"); // card | wallet | transfer (demo)
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [discountExtra, setDiscountExtra] = useState(0); // giảm thêm do mã (mock)

  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrolled, setEnrolled] = useState(false);

  // fetch course
  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        setLoadingCourse(true);
        setCourseError("");
        const res = await fetch(`${API_BASE}/api/courses/${id}`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCourse(data);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setCourseError("Không tải được thông tin khoá học.");
        }
      } finally {
        setLoadingCourse(false);
      }
    }
    load();
    return () => ac.abort();
  }, [id]);

  const hasDiscount = useMemo(() => {
    if (!course) return false;
    return typeof course.discountPrice === "number" &&
      course.discountPrice > 0 &&
      course.discountPrice < (course.price ?? 0);
  }, [course]);

  const basePrice = course?.price ?? 0;
  const discounted = hasDiscount ? course.discountPrice : basePrice;
  const finalPrice = Math.max(0, discounted - discountExtra);

  const percentOff = useMemo(() => {
    if (!course || !hasDiscount) return 0;
    if (course.price > 0) {
      return Math.round(((course.price - course.discountPrice) / course.price) * 100);
    }
    return 0;
  }, [course, hasDiscount]);

  const applyCoupon = async () => {
    // Demo: mã "HELLO10" giảm thêm 10k, "FREESTUDY" free hoàn toàn.
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    try {
      setApplying(true);
      await new Promise((r) => setTimeout(r, 600)); // giả lập chờ API validate
      if (code === "HELLO10") {
        setDiscountExtra(10000);
      } else if (code === "FREESTUDY") {
        setDiscountExtra(discounted); // đưa về 0
      } else {
        setDiscountExtra(0);
        alert("Mã không hợp lệ hoặc đã hết hạn.");
      }
    } finally {
      setApplying(false);
    }
  };

  const doEnroll = async () => {
    try {
      setEnrollError("");
      setEnrolling(true);

      // Tùy backend, body có thể cần nhiều trường hơn; ở đây demo body tối giản
      const res = await fetch(`${API_BASE}/api/courses/${id}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,         // demo
          couponCode: coupon.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Enroll failed (${res.status})`);
      }

      // Backend có thể trả enrollmentId; tạm đánh dấu thành công
      setEnrolled(true);

      // Điều hướng: vào phòng học hoặc danh sách ghi danh
      setTimeout(() => navigate(`/s/learning/${id}`), 800);
    } catch (e) {
      console.error(e);
      setEnrollError("Ghi danh thất bại. Vui lòng thử lại.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="rounded-lg border px-3 py-1.5 hover:bg-white/60 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Ghi danh khóa học
              </h1>
              <p className="text-gray-600 text-sm">
                Thanh toán an toàn • Truy cập trọn đời • Hỗ trợ hoá đơn
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-sm text-gray-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Bảo mật thanh toán</span>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8">
        {/* LEFT: course info + payment */}
        <section className="space-y-6">
          {/* course card */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            {loadingCourse ? (
              <div className="p-6 text-gray-600 inline-flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải thông tin khoá học…
              </div>
            ) : courseError ? (
              <div className="p-6 text-rose-700 bg-rose-50 border-b border-rose-200 inline-flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {courseError}
              </div>
            ) : course ? (
              <>
                <div className="aspect-[16/9] bg-gray-100 grid place-items-center overflow-hidden">
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      src={course.thumbnailUrl}
                      alt={`Thumbnail ${course.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Ảnh khoá học</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-xs text-gray-600">
                    Danh mục: <b className="text-gray-800">{course.categoryName || "—"}</b> •
                    {" "}Cập nhật {fmtDate(course.updatedAt)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {course.title}
                  </h2>
                  <p className="text-gray-700 text-sm mt-1">{course.description}</p>

                  <div className="mt-3 flex items-end gap-2">
                    <div className="text-2xl font-extrabold text-gray-900">
                      {money(finalPrice)}
                    </div>
                    {hasDiscount && (
                      <>
                        <div className="text-sm text-gray-500 line-through">
                          {money(course.price)}
                        </div>
                        {percentOff > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Giảm {percentOff}%
                          </span>
                        )}
                      </>
                    )}
                    {discountExtra > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        Mã giảm {money(discountExtra)}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* payment options */}
          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <PayOption
                icon={<CreditCard className="w-4 h-4" />}
                label="Thẻ/VNPay"
                value="card"
                method={method}
                setMethod={setMethod}
              />
              <PayOption
                icon={<Wallet className="w-4 h-4" />}
                label="Ví điện tử"
                value="wallet"
                method={method}
                setMethod={setMethod}
              />
              <PayOption
                icon={<ReceiptText className="w-4 h-4" />}
                label="Chuyển khoản"
                value="transfer"
                method={method}
                setMethod={setMethod}
              />
            </div>

            {/* coupon */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <div className="relative">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Nhập mã giảm giá (VD: HELLO10, FREESTUDY)…"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-9 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <button
                onClick={applyCoupon}
                disabled={applying || !coupon.trim()}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                  applying ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-50"
                }`}
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Áp dụng
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 inline-flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 mt-0.5" />
              <div>
                Đây là bản demo: phương thức thanh toán mô phỏng. Sau khi bấm “Ghi danh”, hệ thống gọi
                <code className="px-1"> POST /api/courses/{id}/enrollments </code> để tạo bản ghi ghi danh.
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <Link
              to={`/courses/${id}`}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Xem chi tiết khoá
            </Link>
            <button
              onClick={doEnroll}
              disabled={enrolling || !course}
              className={`rounded-xl px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 ${
                enrolling || !course
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <LockKeyhole className="w-4 h-4" />}
              {finalPrice > 0 ? "Thanh toán & Ghi danh" : "Ghi danh miễn phí"}
            </button>
          </div>

          {enrollError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-3 inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {enrollError}
            </div>
          )}
          {enrolled && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ghi danh thành công! Đang chuyển tới phòng học…
            </div>
          )}
        </section>

        {/* RIGHT: order summary */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="text-sm font-bold text-gray-900">Tóm tắt thanh toán</h3>
            </div>
            <div className="p-5 text-sm text-gray-700 grid gap-2">
              <Row label="Giá gốc" value={money(basePrice)} />
              {hasDiscount && (
                <Row label="Giá ưu đãi" value={money(course.discountPrice)} />
              )}
              {discountExtra > 0 && <Row label="Giảm thêm (mã)" value={`- ${money(discountExtra)}`} />}
              <div className="h-px bg-gray-200 my-2" />
              <Row label={<b>Tổng thanh toán</b>} value={<b>{money(finalPrice)}</b>} />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Quyền lợi</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Truy cập trọn đời toàn bộ nội dung.</li>
              <li>• Cập nhật bài học liên tục.</li>
              <li>• Hỗ trợ hoá đơn VAT theo yêu cầu.</li>
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* ===== Small UI pieces ===== */
function PayOption({ icon, label, value, method, setMethod }) {
  const active = method === value;
  return (
    <button
      type="button"
      onClick={() => setMethod(value)}
      className={`rounded-xl border p-3 text-left text-sm inline-flex items-center gap-2 ${
        active ? "border-blue-300 bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
