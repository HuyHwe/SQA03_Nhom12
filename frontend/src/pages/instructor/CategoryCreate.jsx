// src/pages/instructor/CategoryCreate.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Save, Hash, ArrowLeft, FolderPlus, Info, CheckCircle2 } from "lucide-react";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CategoryCreate() {
  const navigate = useNavigate();
  useEffect(() => window.scrollTo(0, 0), []);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim()) e.name = "Vui lòng nhập tên danh mục";
    if (!slug.trim()) e.slug = "Slug không được để trống";
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) e.slug = "Slug chỉ gồm a-z0-9 và dấu gạch ngang";
    if (name.length > 80) e.name = "Tên tối đa 80 ký tự";
    if (desc.length > 160) e.desc = "Mô tả tối đa 160 ký tự";
    return e;
  }, [name, slug, desc]);

  const canSave = Object.keys(errors).length === 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);

    // ---- MOCK CALL ----
    // Thực tế: POST api/categories  { name, slug, description }
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSavedAt(new Date());

    alert("Đã tạo danh mục (demo).");
    navigate("/i/categories");
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/i/categories" className="rounded-lg border px-3 py-1.5 hover:bg-white/60 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Danh sách
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">📁 Tạo danh mục</h1>
              <p className="text-gray-600">Khai báo tên/slug mô tả ngắn. Dữ liệu thời gian dùng ISO ở phía server.</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 inline-flex items-center gap-2">
            {savedAt ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã lưu {savedAt.toLocaleTimeString()}
              </>
            ) : (
              <>
                <Info className="w-4 h-4" /> Chưa lưu
              </>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="w-full px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* LEFT: form */}
          <section className="rounded-2xl border bg-white p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Thông tin danh mục</h2>
              <p className="text-sm text-gray-600">Tên hiển thị, slug duy nhất và mô tả ngắn.</p>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-800">Tên danh mục *</span>
                <input
                  value={name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setName(v);
                    if (!slug) setSlug(slugify(v));
                  }}
                  className={`rounded-xl border px-4 py-2 outline-none focus:ring-2 ${
                    errors.name ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                {errors.name && <span className="text-xs text-rose-600">{errors.name}</span>}
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-800">Slug *</span>
                <div className={`flex rounded-xl border overflow-hidden ${errors.slug ? "border-rose-300" : "border-gray-300"}`}>
                  <span className="px-3 bg-gray-50 text-gray-600 text-sm inline-flex items-center">
                    <Hash className="w-4 h-4 mr-1" /> /categories/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="flex-1 px-3 outline-none text-sm"
                  />
                </div>
                {errors.slug && <span className="text-xs text-rose-600">{errors.slug}</span>}
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-gray-800">Mô tả (≤ 160 ký tự)</span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value.slice(0, 160))}
                  rows={3}
                  className={`rounded-xl border px-4 py-2 outline-none focus:ring-2 ${
                    errors.desc ? "border-rose-300 focus:ring-rose-200" : "border-gray-300 focus:ring-blue-200"
                  }`}
                />
                <span className="text-xs text-gray-500">{desc.length} / 160</span>
                {errors.desc && <span className="text-xs text-rose-600">{errors.desc}</span>}
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Link to="/i/categories" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
                Huỷ
              </Link>
              <button
                onClick={save}
                disabled={!canSave}
                className={`rounded-xl px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 ${
                  canSave ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Save className="w-4 h-4" /> Lưu
              </button>
            </div>
          </section>

          {/* RIGHT: preview */}
          <aside className="rounded-2xl border bg-white overflow-hidden">
            <div className="aspect-video bg-gray-100 grid place-items-center text-gray-500">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div className="p-5">
              <div className="text-xs text-gray-600 mb-1">Xem trước</div>
              <h3 className="text-lg font-bold text-gray-900">{name || "Tên danh mục"}</h3>
              <div className="text-sm text-gray-700 mt-1">{desc || "Mô tả ngắn hiển thị tại trang danh mục."}</div>
              <div className="mt-3 text-xs text-gray-600 inline-flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> /categories/{slug || "your-slug"}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
