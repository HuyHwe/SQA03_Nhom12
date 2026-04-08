// src/pages/instructor/CourseRevenue.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  DollarSign, Download, CalendarRange, ArrowUpDown, Filter,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Users, Receipt
} from "lucide-react";

/**
 * Doanh thu & Đơn hàng theo khoá (Instructor)
 *
 * Dựa trên API hiện có (chưa có orders riêng), bạn có thể:
 * - Tạm lấy từ enrollments (pricePaid, createdAt) để suy ra revenue.
 * - Hoặc sau này thêm endpoint đơn hàng riêng → chỉ cần thay phần fetch.
 *
 * Lưu ý: Toàn bộ mock dưới đây dùng ISO datetime giống format backend của bạn.
 */

// ===== Mock orders (ISO datetime) =====
// status: paid | refunded | pending
const MOCK_ORDERS = Array.from({ length: 64 }, (_, i) => {
  const day = String(((i % 27) + 1)).padStart(2, "0");
  const statuses = ["paid", "paid", "paid", "refunded", "pending"]; // bias về paid
  const st = statuses[i % statuses.length];
  const price = [19.99, 29.9, 39.93, 45.15, 59.0][i % 5];
  const feePct = 0.15; // giả định phí platform 15%
  const net = st === "paid" ? +(price * (1 - feePct)).toFixed(2) : 0;
  return {
    id: `ord-${1000 + i}`,
    userId: `u-${2000 + i}`,
    buyer: ["Lê Minh", "Nguyễn Hoa", "Phạm Tuấn", "Trần Dũng", "Vũ Hạnh", "Phan Huy", "Bùi Nga", "Đỗ Lộc"][i % 8],
    email: `buyer${i + 1}@mail.com`,
    status: st,
    gross: price,
    fee: +(price - net).toFixed(2),
    net,
    createdAt: `2025-11-${day}T0${i % 9}:2${i % 6}:43.1200000`,
    updatedAt: `2025-11-${day}T1${i % 9}:3${i % 6}:21.5600000`,
  };
});

const PAGE_SIZE = 12;

const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

export default function CourseRevenue() {
  const { id } = useParams(); // courseId

  useEffect(() => window.scrollTo(0, 0), []);

  // ====== Filters / sort / paging ======
  const [q, setQ] = useState("");                // search buyer/email
  const [status, setStatus] = useState("all");   // all | paid | refunded | pending
  const [sortBy, setSortBy] = useState("recent"); // recent | amount_desc | amount_asc | name
  const [page, setPage] = useState(1);

  // Range filter (ISO yyyy-mm-dd) – demo, mặc định tháng 11/2025
  const [from, setFrom] = useState("2025-11-01");
  const [to, setTo] = useState("2025-11-30");

  // ====== Data (mock) – thay bằng fetch khi có API orders ======
  const orders = MOCK_ORDERS;

  // ====== Derived list ======
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    const start = from ? new Date(`${from}T00:00:00.000Z`) : null;
    const end = to ? new Date(`${to}T23:59:59.999Z`) : null;

    let arr = orders.filter(o => {
      // status
      const okStatus = status === "all" ? true : o.status === status;
      // search
      const okQ = !k || o.buyer.toLowerCase().includes(k) || o.email.toLowerCase().includes(k) || o.id.toLowerCase().includes(k);
      // date range theo createdAt
      const t = new Date(o.createdAt);
      const okFrom = start ? t >= start : true;
      const okTo = end ? t <= end : true;

      return okStatus && okQ && okFrom && okTo;
    });

    arr.sort((a, b) => {
      if (sortBy === "amount_desc") return b.gross - a.gross;
      if (sortBy === "amount_asc") return a.gross - b.gross;
      if (sortBy === "name") return a.buyer.localeCompare(b.buyer);
      // recent = updated desc
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return arr;
  }, [orders, q, status, sortBy, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ====== KPIs ======
  const kpis = useMemo(() => {
    const total = filtered.length;
    const paid = filtered.filter(o => o.status === "paid");
    const refunded = filtered.filter(o => o.status === "refunded");
    const gross = paid.reduce((s, o) => s + o.gross, 0);
    const fees = paid.reduce((s, o) => s + o.fee, 0);
    const net = paid.reduce((s, o) => s + o.net, 0);
    const arpu = total ? gross / total : 0;

    // Trend demo: so sánh nửa đầu & nửa cuối range
    const mid = Math.floor(filtered.length / 2);
    const head = filtered.slice(0, mid).reduce((s, o) => s + (o.status === "paid" ? o.net : 0), 0);
    const tail = filtered.slice(mid).reduce((s, o) => s + (o.status === "paid" ? o.net : 0), 0);
    const trendUp = tail >= head;

    // Spark data (doanh thu theo ngày)
    const byDay = {};
    filtered.forEach(o => {
      const d = o.createdAt.slice(0, 10); // yyyy-mm-dd
      byDay[d] = (byDay[d] || 0) + (o.status === "paid" ? o.net : 0);
    });
    const days = Object.keys(byDay).sort();
    const series = days.map(d => +byDay[d].toFixed(2));

    return {
      total, gross: +gross.toFixed(2), fees: +fees.toFixed(2), net: +net.toFixed(2), arpu: +arpu.toFixed(2),
      refunded: refunded.length,
      trendUp, series, labels: days,
    };
  }, [filtered]);

  // ====== Export CSV ======
  const exportCSV = () => {
    const rows = [
      ["orderId","buyer","email","status","gross","fee","net","createdAt","updatedAt"],
      ...filtered.map(o => [
        o.id, o.buyer, o.email, o.status, o.gross, o.fee, o.net, o.createdAt, o.updatedAt
      ])
    ].map(r => r.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `course_${id}_orders.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ====== Spark path (simple) ======
  const sparkPath = useMemo(() => {
    const W = 160, H = 48;
    const s = kpis.series;
    if (!s.length) return "";
    const max = Math.max(...s, 1);
    const step = s.length > 1 ? W / (s.length - 1) : W;
    const pts = s.map((v, i) => {
      const x = i * step;
      const y = H - (H * v) / max;
      return `${x},${y}`;
    });
    return `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  }, [kpis.series]);

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">💰 Doanh thu khoá #{id}</h1>
            <p className="text-gray-600">Tổng quan doanh thu, phí nền tảng, đơn hàng và xu hướng theo thời gian.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link to={`/i/courses/${id}/enrollments`} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
              Ghi danh
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[1.55fr_400px] gap-8">
        {/* LEFT: controls + kpis + list */}
        <section className="space-y-6">
          {/* Toolbar */}
          <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Tìm theo người mua, email hoặc mã đơn…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
              <span className="text-gray-500">—</span>
              <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="recent">Cập nhật gần đây</option>
                <option value="amount_desc">Số tiền ↓</option>
                <option value="amount_asc">Số tiền ↑</option>
                <option value="name">Tên A→Z</option>
              </select>
            </div>
          </div>

          {/* KPIs + Spark */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI icon={<DollarSign className="w-4 h-4" />} label="Gross (paid)" value={`${kpis.gross.toLocaleString("vi-VN")}đ`} />
            <KPI icon={<Receipt className="w-4 h-4" />} label="Phí nền tảng" value={`${kpis.fees.toLocaleString("vi-VN")}đ`} />
            <KPI icon={<DollarSign className="w-4 h-4" />} label="Net về GV" value={`${kpis.net.toLocaleString("vi-VN")}đ`} />
            <KPI icon={<Users className="w-4 h-4" />} label="Số đơn (lọc)" value={kpis.total} />
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                ARPU (gross / đơn): <b>{kpis.arpu.toLocaleString("vi-VN")}đ</b>
              </div>
              <div className={`inline-flex items-center gap-1 text-sm ${kpis.trendUp ? "text-emerald-700" : "text-rose-700"}`}>
                {kpis.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                Xu hướng doanh thu {kpis.trendUp ? "tăng" : "giảm"} (demo)
              </div>
            </div>
            <div className="mt-3">
              <Spark series={kpis.series} />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
              <div className="col-span-4">Đơn hàng</div>
              <div className="col-span-2 text-center">Trạng thái</div>
              <div className="col-span-2 text-right">Gross</div>
              <div className="col-span-2 text-right">Net</div>
              <div className="col-span-2">Ngày</div>
            </div>

            {view.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-600">
                Không có đơn hàng khớp bộ lọc hiện tại.
              </div>
            )}

            {view.map(o => (
              <div key={o.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
                <div className="col-span-4 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{o.id}</div>
                  <div className="text-xs text-gray-600 truncate">{o.buyer} • {o.email}</div>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    o.status === "paid" ? "bg-emerald-100 text-emerald-700"
                    : o.status === "refunded" ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>{o.status}</span>
                </div>
                <div className="col-span-2 text-right text-sm text-gray-800">{o.gross.toLocaleString("vi-VN")}đ</div>
                <div className="col-span-2 text-right text-sm font-semibold text-gray-900">{o.net.toLocaleString("vi-VN")}đ</div>
                <div className="col-span-2 text-xs text-gray-700">
                  <div>Created: {fmtDateTime(o.createdAt)}</div>
                  <div>Updated: {fmtDateTime(o.updatedAt)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đơn
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

        {/* RIGHT: Ghi chú & hướng dẫn kết nối dữ liệu thật */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Kết nối dữ liệu thật</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Nếu chưa có API đơn hàng: có thể dùng <b>GET api/courses/{`{courseId}`}/enrollments</b> và đọc <i>pricePaid</i>, <i>createdAt</i>.</li>
              <li>• Khi có endpoint orders riêng, thay thế `MOCK_ORDERS` bằng `fetch` và giữ nguyên ISO datetime.</li>
              <li>• Phí nền tảng hiện giả định 15% để tính <i>net</i>; chuyển sang server-side khi triển khai.</li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Gợi ý</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Thêm lọc theo <b>khoảng tiền</b> nếu cần.</li>
              <li>• Thêm export <b>Excel</b> hoặc <b>PDF</b> (server-side).</li>
              <li>• Thêm biểu đồ theo tuần/tháng để nhìn xu hướng dài hạn.</li>
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

/* ===== Small UI pieces ===== */
function KPI({ icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs text-gray-600 inline-flex items-center gap-2">{icon} {label}</div>
      <div className="mt-1 text-2xl font-extrabold text-gray-900">{value}</div>
    </div>
  );
}

function Spark({ series }) {
  if (!series.length) {
    return <div className="text-xs text-gray-500">Chưa có dữ liệu trong khoảng thời gian.</div>;
  }
  const W = 160, H = 48;
  const max = Math.max(...series, 1);
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const pts = series.map((v, i) => {
    const x = i * step;
    const y = H - (H * v) / max;
    return `${x},${y}`;
  });
  const path = `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="text-blue-600">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
