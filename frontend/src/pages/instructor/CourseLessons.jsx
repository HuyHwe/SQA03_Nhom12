// src/pages/instructor/CourseLessons.jsx
"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, GripVertical, Pencil, Trash2, Save, Check, X, ArrowUp, ArrowDown,
  PlayCircle, BookOpen, HelpCircle, Clock, Layers
} from "lucide-react";

/* ========= Mock init ========= */
const INIT = [
  { id: 1, title: "Giới thiệu khoá học", type: "video",   duration: "06:12", published: true  },
  { id: 2, title: "Cài đặt môi trường",  type: "video",   duration: "08:34", published: true  },
  { id: 3, title: "State & Props",       type: "reading", duration: "",      published: false },
];

/* icon theo loại bài */
const TypeChip = ({ type }) => {
  const base = "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full";
  if (type === "video")   return <span className={`${base} bg-red-100 text-red-700`}><PlayCircle className="w-3.5 h-3.5" /> Video</span>;
  if (type === "reading") return <span className={`${base} bg-amber-100 text-amber-800`}><BookOpen className="w-3.5 h-3.5" /> Reading</span>;
  return <span className={`${base} bg-indigo-100 text-indigo-800`}><HelpCircle className="w-3.5 h-3.5" /> Quiz</span>;
};

const validDuration = (s) => !s || /^\d{1,2}:\d{2}$/.test(s); // mm:ss đơn giản

export default function CourseLessons() {
  const { id } = useParams();
  const [items, setItems] = useState(INIT);
  const [newRow, setNewRow] = useState({ title: "", type: "video", duration: "", published: false });

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: "", type: "video", duration: "", published: false });

  // DnD state
  const dragId = useRef(null);

  useEffect(() => window.scrollTo(0, 0), []);

  const publishedCount = useMemo(() => items.filter(i => i.published).length, [items]);

  /* ========= CRUD ========= */
  const addLesson = () => {
    if (!newRow.title.trim()) return;
    if (!validDuration(newRow.duration)) {
      return alert("Thời lượng không hợp lệ. Định dạng mm:ss (VD: 08:30) hoặc để trống với Reading/Quiz.");
    }
    setItems((arr) => [
      ...arr,
      {
        id: Date.now(),
        title: newRow.title.trim(),
        type: newRow.type,
        duration: newRow.type === "video" ? (newRow.duration || "00:00") : "",
        published: newRow.published,
      },
    ]);
    setNewRow({ title: "", type: "video", duration: "", published: false });
  };

  const startEdit = (l) => {
    setEditingId(l.id);
    setDraft({ ...l });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ title: "", type: "video", duration: "", published: false });
  };
  const saveEdit = () => {
    if (!draft.title.trim()) return;
    if (!validDuration(draft.duration)) {
      return alert("Thời lượng không hợp lệ. Định dạng mm:ss.");
    }
    setItems(arr => arr.map(i => (i.id === editingId ? { ...draft, title: draft.title.trim(), duration: draft.type === "video" ? (draft.duration || "00:00") : "" } : i)));
    cancelEdit();
  };

  const togglePub = (lid) =>
    setItems((arr) => arr.map((l) => (l.id === lid ? { ...l, published: !l.published } : l)));

  const remove = (lid) => {
    if (!confirm("Xoá bài học này?")) return;
    setItems((arr) => arr.filter((l) => l.id !== lid));
  };

  const move = (lid, dir) => {
    setItems((arr) => {
      const idx = arr.findIndex(i => i.id === lid);
      if (idx < 0) return arr;
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return arr;
      const next = [...arr];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  /* ========= Drag & drop ========= */
  const onDragStart = (lid) => (e) => {
    dragId.current = lid;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (targetId) => (e) => {
    e.preventDefault();
    const sourceId = dragId.current;
    if (sourceId == null || sourceId === targetId) return;

    setItems((arr) => {
      const srcIdx = arr.findIndex(i => i.id === sourceId);
      const dstIdx = arr.findIndex(i => i.id === targetId);
      if (srcIdx < 0 || dstIdx < 0) return arr;
      const next = [...arr];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(dstIdx, 0, moved);
      return next;
    });
    dragId.current = null;
  };

  const saveAll = () => {
    // demo: chỉ log ra, sau này gọi API
    console.log("LESSONS_SAVE", items);
    alert("Đã lưu thay đổi (demo). Xem console để kiểm tra payload.");
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Header />

      {/* Hero */}
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">🧱 Bài học của khoá #{id}</h1>
            <p className="text-gray-600">Thêm / sắp xếp / publish bài học • <b>{publishedCount}</b>/<b>{items.length}</b> đã publish</p>
          </div>
          <Link to={`/i/courses/${id}/edit`} className="text-blue-600 hover:text-blue-700 text-sm">Quay về chỉnh sửa khoá</Link>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 space-y-6">
        {/* Add new */}
        <div className="rounded-2xl border bg-white p-5 grid gap-3 md:grid-cols-[1fr_160px_160px_140px] md:items-center">
          <input
            value={newRow.title}
            onChange={(e) => setNewRow(r => ({ ...r, title: e.target.value }))}
            placeholder="Tiêu đề bài học mới…"
            className="rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newRow.type}
            onChange={(e) => setNewRow(r => ({ ...r, type: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="video">Video</option>
            <option value="reading">Reading</option>
            <option value="quiz">Quiz</option>
          </select>
          <div className="relative">
            <input
              value={newRow.duration}
              onChange={(e) => setNewRow(r => ({ ...r, duration: e.target.value }))}
              placeholder="mm:ss (video)"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={newRow.published}
                onChange={(e) => setNewRow(r => ({ ...r, published: e.target.checked }))}
              />
              Publish
            </label>
            <button
              onClick={addLesson}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="rounded-2xl border bg-white p-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setItems(arr => arr.map(i => ({ ...i, published: true })))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Publish tất cả
          </button>
          <button
            onClick={() => setItems(arr => arr.map(i => ({ ...i, published: false })))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Unpublish tất cả
          </button>
          <span className="ml-auto text-xs text-gray-500 inline-flex items-center gap-1">
            <Layers className="w-4 h-4" /> Kéo-thả để sắp xếp, hoặc dùng mũi tên ↑/↓
          </span>
        </div>

        {/* List */}
        <div className="rounded-2xl border bg-white divide-y">
          {items.map((l, idx) => {
            const isEditing = editingId === l.id;
            return (
              <div
                key={l.id}
                draggable
                onDragStart={onDragStart(l.id)}
                onDragOver={onDragOver}
                onDrop={onDrop(l.id)}
                className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-3 group"
              >
                <div className="flex items-center gap-3 md:w-8 shrink-0">
                  <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-gray-600 cursor-grab" />
                  <span className="text-xs text-gray-500">{idx + 1}</span>
                </div>

                {/* content */}
                {!isEditing ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{l.title}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                        <TypeChip type={l.type} />
                        {l.type === "video" && <span>• Thời lượng: {l.duration || "—"}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 inline-flex items-center gap-2">
                        <input type="checkbox" checked={l.published} onChange={() => togglePub(l.id)} />
                        Publish
                      </label>

                      <button onClick={() => move(l.id, "up")}   className="rounded-lg border px-2 py-2 hover:bg-gray-50" title="Lên">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => move(l.id, "down")} className="rounded-lg border px-2 py-2 hover:bg-gray-50" title="Xuống">
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button onClick={() => startEdit(l)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Sửa
                      </button>
                      <button onClick={() => remove(l.id)} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2 text-red-600 border-red-200">
                        <Trash2 className="w-4 h-4" /> Xoá
                      </button>
                    </div>
                  </>
                ) : (
                  // editing row
                  <div className="flex-1 grid gap-2 md:grid-cols-[1fr_160px_160px_auto] md:items-center">
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={draft.type}
                      onChange={(e) => setDraft(d => ({ ...d, type: e.target.value }))}
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="video">Video</option>
                      <option value="reading">Reading</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <input
                      value={draft.duration}
                      onChange={(e) => setDraft(d => ({ ...d, duration: e.target.value }))}
                      placeholder="mm:ss"
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700 inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={draft.published}
                          onChange={(e) => setDraft(d => ({ ...d, published: e.target.checked }))}
                        />
                        Publish
                      </label>
                      <button onClick={saveEdit} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2 text-emerald-700 border-emerald-200">
                        <Check className="w-4 h-4" /> Lưu
                      </button>
                      <button onClick={cancelEdit} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2 text-gray-700">
                        <X className="w-4 h-4" /> Huỷ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save all */}
        <div className="flex items-center justify-end">
          <button
            onClick={saveAll}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}



























