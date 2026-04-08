// src/pages/student/Billing.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Receipt, Search, Filter, ArrowUpDown, Download, Eye, ChevronLeft, ChevronRight,
  CheckCircle2, Clock3, Ban, FileText, CreditCard
} from "lucide-react";

/** Bạn có thể thay bằng base URL thật khi backend sẵn sàng */
const API_BASE = "http://localhost:5102";

/** Mock list giao dịch (ISO date giống mẫu API) */
const MOCK_ORDERS = [
  {
    id: "INV-2025-1108-001",
    createdAt: "2025-11-08T09:22:05.1102321",
    updatedAt: "2025-11-08T09:22:05.1102321",
    courseId: "react-18-pro-id",
    courseTitle: "React 18 Pro — Hooks, Router, Performance",
    price: 990000,
    discountPrice: 891000,
    status: "paid", // paid | pending | refunded | failed
    paymentMethod: "VNPAY",
    invoiceUrl: null,
  },
  {
    id: "INV-2025-1103-002",
    createdAt: "2025-11-03T19:05:40.4203112",
    updatedAt: "2025-11-03T19:06:01.1200020",
    courseId: "node-api-id",
    courseTitle: "Node.js RESTful API căn bản",
    price: 750000,
    discountPrice: 610000,
    status: "refunded",
    paymentMethod: "CreditCard",
    invoiceUrl: "/invoices/INV-2025-1103-002.pdf",
  },
  {
    id: "INV-2025-1029-103",
    createdAt: "2025-10-29T08:11:10.0049000",
    updatedAt: "2025-10-29T08:11:10.0049000",
    courseId: "sql-practical-id",
    courseTitle: "SQL Practical for Dev",
    price: 590000,
    discountPrice: 590000,
    status: "paid",
    paymentMethod: "Momo",
    invoiceUrl: null,
  },
  {
    id: "INV-2025-1025-204",
    createdAt: "2025-10-25T20:01:31.2200012",
    updatedAt: "2025-10-25T20:01:31.2200012",
    courseId: "devops-begin-id",
    courseTitle: "DevOps cơ bản",
    price: 650000,
    discountPrice: 650000,
    status: "pending",
    paymentMethod: "CreditCard",
    invoiceUrl: null,
  },
];

const moneyVN = new Intl.NumberFormat("vi-VN").format;
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

const STATUS_BADGE = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  refunded: "bg-indigo-100 text-indigo-700",
  failed: "bg-rose-100 text-rose-700",
};

const PAGE_SIZE = 10;

export default function Billing() {
  const navigate = useNavigate();

  useEffect(() => window.scrollTo(0, 0), []);

  // ====== States ======
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | paid | pending | refunded | failed
  const [sortBy, setSortBy] = useState("recent"); // recent | amount | course
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);

  // ====== (Tuỳ chọn) load từ API thật nếu có ======
  // useEffect(() => {
  //   let ignore = false;
  //   const ac = new AbortController();
  //   async function load() {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(`${API_BASE}/api/me/orders`, { signal: ac.signal });
  //       if (res.ok) {
  //         const data = await res.json();
  //         if (!ignore) setRows(normalizeOrders(data));
  //       }
  //     } catch {/* ignore */} finally {
  //       if (!ignore) setLoading(false);
  //     }
  //   }
  //   load();
  //   return () => { ignore = true; ac.abort(); };
  // }, []);

  // ====== Derived ======
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    let arr = rows.filter((o) => {
      const okQ =
        !k ||
        o.id.toLowerCase().includes(k) ||
        (o.courseTitle || "").toLowerCase().includes(k) ||
        (o.paymentMethod || "").toLowerCase().includes(k);
      const okStatus = status === "all" ? true : o.status === status;
      return okQ && okStatus;
    });

    arr = arr.sort((a, b) => {
      if (sortBy === "amount") return (b.discountPrice ?? b.price ?? 0) - (a.discountPrice ?? a.price ?? 0);
      if (sortBy === "course") return (a.courseTitle || "").localeCompare(b.courseTitle || "");
      // recent: updatedAt desc -> createdAt desc
      const da = a.updatedAt || a.createdAt || "";
      const db = b.updatedAt || b.createdAt || "";
      return db.localeCompare(da);
    });

    return arr;
  }, [rows, q, status, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const view = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [q, status, sortBy]);

  // ====== Actions ======
  const exportCSV = () => {
    const rowsCsv = [
      ["invoiceId", "courseTitle", "amount", "status", "paymentMethod", "createdAt", "updatedAt"],
      ...filtered.map((o) => [
        o.id,
        o.courseTitle || "",
        o.discountPrice ?? o.price ?? 0,
        o.status,
        o.paymentMethod || "",
        o.createdAt || "",
        o.updatedAt || "",
      ]),
    ]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([rowsCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadInvoice = async (row) => {
    // Demo: nếu có URL sẵn thì mở, nếu chưa có thì tạo PDF giả (có thể thay bằng API /invoices/{id})
    if (row.invoiceUrl) {
      window.open(row.invoiceUrl, "_blank");
      return;
    }
    alert("Hóa đơn chưa sẵn sàng. (demo)");
  };

  // ====== UI ======
  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">🧾 Lịch sử giao dịch</h1>
            <p className="text-gray-600">Xem và tải hóa đơn các khóa học bạn đã mua</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link
              to="/s/enrollments"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2"
            >
              Về khóa học của tôi
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-6">
        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-[44%]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo mã hóa đơn, tên khóa học, phương thức thanh toán…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Đang xử lý</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="failed">Thất bại</option>
            </select>

            <ArrowUpDown className="w-4 h-4 text-gray-600 ml-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="recent">Mới nhất</option>
              <option value="amount">Số tiền</option>
              <option value="course">Tên khóa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
            <div className="col-span-3">Hóa đơn</div>
            <div className="col-span-3">Khóa học</div>
            <div className="col-span-2 text-right">Số tiền</div>
            <div className="col-span-2 text-center">Trạng thái</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {loading && (
            <div className="px-5 py-6 text-sm text-gray-600">Đang tải…</div>
          )}

          {!loading && view.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-600">
              Chưa có giao dịch nào khớp bộ lọc hiện tại.
            </div>
          )}

          {view.map((o) => (
            <div key={o.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center">
              {/* invoice info */}
              <div className="col-span-3">
                <div className="font-medium text-gray-900 inline-flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> {o.id}
                </div>
                <div className="text-xs text-gray-600">
                  Tạo: {fmtDate(o.createdAt)}{o.updatedAt && ` • Cập nhật: ${fmtDate(o.updatedAt)}`}
                </div>
                <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                  <CreditCard className="w-3.5 h-3.5" /> {o.paymentMethod || "—"}
                </div>
              </div>

              {/* course */}
              <div className="col-span-3">
                <div className="font-medium text-gray-900 line-clamp-2">{o.courseTitle}</div>
                <Link
                  to={`/courses/${o.courseId}`}
                  className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-0.5"
                >
                  Xem khóa học <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* amount */}
              <div className="col-span-2 text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {moneyVN(o.discountPrice ?? o.price ?? 0)}đ
                </div>
                {o.discountPrice != null && o.discountPrice < o.price && (
                  <div className="text-xs text-gray-500 line-through">{moneyVN(o.price)}đ</div>
                )}
              </div>

              {/* status */}
              <div className="col-span-2 text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[o.status] || "bg-gray-100 text-gray-700"}`}>
                  {renderStatus(o.status)}
                </span>
              </div>

              {/* actions */}
              <div className="col-span-2">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => downloadInvoice(o)}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                    title="Tải/Hiển thị hóa đơn"
                  >
                    <FileText className="w-4 h-4" /> Hóa đơn
                  </button>
                  <Link
                    to={`/s/enrollments/${o.courseId}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 inline-flex items-center gap-1"
                  >
                    Vào học <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} giao dịch
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
      </main>

      <Footer />
    </div>
  );
}

/* ===== Helpers ===== */

function renderStatus(s) {
  if (s === "paid") return "Đã thanh toán";
  if (s === "pending") return "Đang xử lý";
  if (s === "refunded") return "Đã hoàn tiền";
  if (s === "failed") return "Thất bại";
  return s || "—";
}

// Nếu sau này API trả danh sách orders không cùng field, dùng hàm này để chuẩn hóa.
/* eslint-disable no-unused-vars */
function normalizeOrders(apiRows) {
  // ví dụ chuyển từ cấu trúc khác về cấu trúc UI đang dùng
  return apiRows.map((r) => ({
    id: r.id || r.invoiceId,
    createdAt: r.createdAt || r.created_date,
    updatedAt: r.updatedAt || r.updated_date || r.createdAt,
    courseId: r.courseId || (r.course && r.course.id),
    courseTitle: r.courseTitle || (r.course && r.course.title),
    price: r.price,
    discountPrice: r.discountPrice ?? r.finalAmount ?? r.amount,
    status: r.status,
    paymentMethod: r.paymentMethod || r.channel,
    invoiceUrl: r.invoiceUrl || r.invoice_url || null,
  }));
}
