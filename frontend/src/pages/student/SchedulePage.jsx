// src/pages/Schedule.jsx
// lịch học
"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Trash2,
  Pencil,
  ChevronRight,
} from "lucide-react";

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("my-schedule");
  const [query, setQuery] = useState("");
  const [todos, setTodos] = useState([
    { id: "t1", title: "Học JavaScript: Scope & Closure", time: "07:30 - 08:30", done: false },
    { id: "t2", title: "Làm bài tập: Array Methods", time: "09:00 - 10:00", done: true },
    { id: "t3", title: "Xem lại React Hooks (useMemo, useCallback)", time: "14:00 - 15:00", done: false },
  ]);

  const [newTodo, setNewTodo] = useState({ title: "", time: "" });

  const filteredTodos = todos.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.time.toLowerCase().includes(query.toLowerCase())
  );

  const toggleDone = (id) =>
    setTodos((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const removeTodo = (id) => setTodos((arr) => arr.filter((t) => t.id !== id));

  const addTodo = () => {
    if (!newTodo.title.trim()) return;
    setTodos((arr) => [
      {
        id: "t_" + Date.now(),
        title: newTodo.title.trim(),
        time: newTodo.time.trim() || "Chưa đặt thời gian",
        done: false,
      },
      ...arr,
    ]);
    setNewTodo({ title: "", time: "" });
  };

  return (
    <div className="min-h-screen w-screen max-w-none bg-white text-gray-900 overflow-x-hidden">
      {/* Header tái sử dụng, full-width */}
      <Header />

      {/* HERO: gradient full-bleed */}
      <section className="w-screen max-w-none bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border-b border-gray-200">
        <div className="px-6 lg:px-12 py-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white shadow-sm border border-gray-200">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Lịch học lập trình
              </h1>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("todo-form");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="ml-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-medium transition"
            >
              Tạo lịch học
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("my-schedule")}
              className={`pb-3 font-semibold transition ${
                activeTab === "my-schedule"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lịch học của tôi
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`pb-3 font-semibold transition ${
                activeTab === "explore"
                  ? "text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Khám phá lộ trình
            </button>
          </div>
        </div>
      </section>

      {/* MAIN grid full-width: [content | sidebar] */}
      <main className="w-screen max-w-none px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT: Nội dung chính */}
          <section className="space-y-6">
            {/* Card: Thời biểu trong ngày */}
            <div className="border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-white to-blue-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Thời biểu hôm nay</h3>
                    <p className="text-sm text-gray-600">
                      Tối ưu 3 phiên học ngắn (Deep Work 50-60 phút) cho Frontend
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Quick search trong card */}
                <div className="relative mb-5">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm phiên học, chủ đề…"
                    className="w-full rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-4 py-2 pr-10"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>

                {/* Danh sách phiên học (todos) */}
                <ul className="space-y-3">
                  {filteredTodos.map((t) => (
                    <li
                      key={t.id}
                      className="group border rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition"
                    >
                      <button
                        onClick={() => toggleDone(t.id)}
                        className={`mt-0.5 rounded-full border w-5 h-5 flex items-center justify-center ${
                          t.done
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-gray-300 text-transparent"
                        }`}
                        aria-label="Đánh dấu hoàn thành"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`font-semibold ${
                              t.done ? "line-through text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {t.title}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            <Clock className="w-3 h-3" />
                            {t.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Gợi ý: bật Pomodoro 50’ tập trung + 10’ nghỉ.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          className="p-2 rounded-lg border hover:bg-gray-50"
                          title="Sửa nhanh (demo)"
                          onClick={() =>
                            alert("Bạn có thể gắn modal chỉnh sửa chi tiết tại đây.")
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg border hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          title="Xoá"
                          onClick={() => removeTodo(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Phân trang mẫu (demo) */}
                <div className="mt-6 flex justify-end">
                  <button className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                    Xem thêm <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card: Chính sách / Thêm mới */}
            <div className="border rounded-2xl shadow-sm overflow-hidden" id="todo-form">
              <div className="px-6 py-4 border-b bg-white">
                <h3 className="font-bold text-lg">Thêm phiên học mới</h3>
                <p className="text-sm text-gray-600">
                  Giữ phiên học <strong>50–60 phút</strong>, mục tiêu rõ ràng, có bài kiểm tra ngắn sau buổi.
                </p>
              </div>

              <div className="p-6 grid md:grid-cols-[1fr_240px_auto] gap-3">
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Ví dụ: Luyện React Router v6 (Routes, NavLink, ProtectedRoute)"
                  className="rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <input
                  type="text"
                  value={newTodo.time}
                  onChange={(e) => setNewTodo((s) => ({ ...s, time: e.target.value }))}
                  placeholder="Ví dụ: 19:30 - 20:30"
                  className="rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <button
                  onClick={addTodo}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium transition"
                >
                  <Plus className="w-5 h-5" />
                  Thêm
                </button>
              </div>

              <div className="px-6 pb-6 text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ưu tiên chủ đề nền tảng (JS, HTTP, Git, React core) trước thư viện nâng cao.</li>
                  <li>Đặt checkpoint kiến thức 2–3 ngày/lần bằng quiz ngắn (10–15 câu).</li>
                  <li>Cuối tuần: tổng hợp ghi chú, refactor code, viết README cho mini-project.</li>
                </ul>
              </div>
            </div>

            {/* Tab "Khám phá" (demo nội dung) */}
            {activeTab === "explore" && (
              <div className="border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-white">
                  <h3 className="font-bold text-lg">Gợi ý lộ trình</h3>
                  <p className="text-sm text-gray-600">
                    Các module kỹ năng lập trình theo cấp độ — có thể thêm trực tiếp vào lịch.
                  </p>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Frontend Essentials",
                      items: ["HTML/CSS hiện đại", "JavaScript cơ bản → nâng cao", "React core"],
                    },
                    {
                      title: "React Pro",
                      items: ["Hooks nâng cao", "Router v6", "State Management (Context/Zustand)"],
                    },
                    {
                      title: "Backend Node.js",
                      items: ["Express/Fastify", "REST API", "ORM (Prisma/TypeORM)"],
                    },
                    {
                      title: "Dev Tools",
                      items: ["Git/GitHub flow", "ESLint/Prettier", "Vite/Turbo/Multi-env"],
                    },
                  ].map((bucket) => (
                    <div
                      key={bucket.title}
                      className="rounded-xl border p-4 hover:shadow-sm transition"
                    >
                      <p className="font-semibold">{bucket.title}</p>
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        {bucket.items.map((it) => (
                          <li key={it} className="flex gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setTodos((arr) => [
                              {
                                id: "t_" + Date.now(),
                                title: `${bucket.title}: ${bucket.items[0]}`,
                                time: "19:00 - 20:00",
                                done: false,
                              },
                              ...arr,
                            ])
                          }
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          Thêm vào lịch <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: Sidebar hẹp, sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              {/* Search box tổng */}
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm nhanh phiên học, chủ đề…"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>

              {/* Promo card lập trình 1 */}
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-sky-100 to-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-700">Lộ trình</p>
                  <p className="font-bold text-gray-900 mt-1">
                    React Fundamentals → React Pro
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    6 tuần • Bài tập dự án • Quiz mỗi module
                  </p>
                </div>
                <div className="p-4">
                  <button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium transition">
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Promo card lập trình 2 */}
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-emerald-100 to-green-50 p-4">
                  <p className="text-xs font-medium text-emerald-700">Khoá học</p>
                  <p className="font-bold text-gray-900 mt-1">Node.js REST API</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Express • Prisma • Auth • Best Practices
                  </p>
                </div>
                <div className="p-4">
                  <button className="w-full rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-2 font-medium transition">
                    Tham khảo
                  </button>
                </div>
              </div>

              {/* Nhắc nhở kỷ luật học */}
              <div className="rounded-2xl border p-4">
                <p className="font-semibold">Mẹo duy trì thói quen</p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Lên lịch cố định theo khung giờ.</li>
                  <li>• Tắt thông báo trong giờ học.</li>
                  <li>• Kết thúc buổi học bằng 5’ ghi chú.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}