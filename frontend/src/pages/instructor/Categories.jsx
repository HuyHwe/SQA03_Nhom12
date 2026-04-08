// src/pages/instructor/Categories.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  FolderPlus, Search, ArrowUpDown, Download, ChevronLeft, ChevronRight,
  Folder, CalendarClock, Hash, Library
} from "lucide-react";

// ===== Mock categories (ISO datetime) =====
const MOCK = [
  {
    id: "f36e85e2-edaa-41da-91ca-b8f74e9bf3cf",
    name: "Cybersecurity",
    slug: "cybersecurity",
    courseCount: 8,
    createdAt: "2025-04-12T08:20:10.1200000",
    updatedAt: "2025-11-06T03:14:55.0100000",
  },
  {
    id: "a8b1c2d3-1111-4bbb-8888-aaaa22223333",
    name: "Frontend Web",
    slug: "frontend-web",
    courseCount: 14,
    createdAt: "2025-03-01T09:01:00.0000000",
    updatedAt: "2025-11-05T22:30:12.0000000",
  },
  {
    id: "bbbbcccc-dddd-eeee-ffff-000011112222",
    name: "Backend",
    slug: "backend",
    courseCount: 11,
    createdAt: "2025-02-18T10:42:30.0000000",
    updatedAt: "2025-10-30T18:12:45.0000000",
  },
  {
    id: "11112222-3333-4444-5555-666677778888",
    name: "Database",
    slug: "database",
    courseCount: 6,
    createdAt: "2025-05-09T14:22:00.0000000",
    updatedAt: "2025-10-28T07:10:00.0000000",
  },
];

const PAGE_SIZE = 10;

export default function Categories() {
  useEffect(() => window.scrollTo(0, 0), []);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent | name | courses_desc | courses_asc
  const [page, setPage] = useState(1);

  const [items] = useState(MOCK);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    let arr = items.filter(
      (c) =>
        !key ||
        c.name.toLowerCase().includes(key) ||
        c.slug.toLowerCase().includes(key)
    );

    arr.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "courses_desc":
          return b.courseCount - a.courseCount;
        case "courses_asc":
          return a.courseCount - b.courseCount;
        case "recent":
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });

    return arr;
  }, [items, q, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const view = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ["id","name","slug","courseCount","createdAt","updatedAt"],
      ...filtered.map(c => [
        c.id, c.name, c.slug, c.courseCount, c.createdAt, c.updatedAt
      ]),
    ]
      .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "categories.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📂 Danh mục khoá học</h1>
            <p className="text-gray-600">Quản lý danh mục, xem số khoá thuộc từng danh mục</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link
              to="/i/categories/new"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Tạo danh mục
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8 space-y-6">
        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên/slug…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="recent">Cập nhật gần đây</option>
              <option value="name">Tên (A→Z)</option>
              <option value="courses_desc">Số khoá ↓</option>
              <option value="courses_asc">Số khoá ↑</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-600 border-b bg-gray-50">
            <div className="col-span-5">Danh mục</div>
            <div className="col-span-2">Slug</div>
            <div className="col-span-2 text-center">Số khoá</div>
            <div className="col-span-3">Thời gian</div>
          </div>

          {view.map((c) => (
            <div key={c.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-b-0 items-center gap-2">
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white grid place-items-center">
                  <Library className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{c.name}</div>
                  <div className="text-xs text-gray-600">ID: {c.id}</div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-800 inline-flex items-center gap-1">
                <Hash className="w-4 h-4" /> {c.slug}
              </div>
              <div className="col-span-2 text-center text-sm text-gray-800">{c.courseCount}</div>
              <div className="col-span-3 text-xs text-gray-600">
                <div className="inline-flex items-center gap-1"><CalendarClock className="w-4 h-4" /> Cập nhật: {fmt(c.updatedAt)}</div>
                <div className="text-[11px] text-gray-500">Tạo: {fmt(c.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, filtered.length)} / {filtered.length} danh mục
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={cur === 1}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
                cur === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-sm">Trang <b>{cur}</b> / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={cur === pages}
              className={`rounded-lg border px-3 py-1.5 inline-flex items-center gap-1 ${
                cur === pages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
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

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { hour12: false });
}
