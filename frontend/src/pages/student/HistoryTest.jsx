// src/pages/Profile.jsx
"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Code2, Trophy } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function HistoryTest() {
  const [activeTab, setActiveTab] = useState("results");

  // ===== DATA (đổi sang nội dung lập trình) =====
  const codingResults = [
    {
      id: "r1",
      name: "JavaScript Foundation Quiz",
      date: "12/10/2025",
      scoreText: "18/25",
      totalScore: 72, // %
      duration: "00:32:14",
      type: "Quiz",
      tag: "JavaScript",
    },
    {
      id: "r2",
      name: "React Hooks & State Management",
      date: "08/10/2025",
      scoreText: "22/30",
      totalScore: 73.3,
      duration: "00:45:30",
      type: "Quiz",
      tag: "React",
    },
    {
      id: "r3",
      name: "Node.js RESTful API – Fundamentals",
      date: "05/10/2025",
      scoreText: "84/100",
      totalScore: 84,
      duration: "01:10:00",
      type: "Assessment",
      tag: "Node.js",
    },
  ];

  const enrolledCourses = [
    {
      id: "c1",
      title: "ReactJS Essentials",
      progress: 65,
      lessonsDone: 26,
      lessonsTotal: 40,
      tag: "Frontend",
    },
    {
      id: "c2",
      title: "Node.js RESTful API",
      progress: 30,
      lessonsDone: 9,
      lessonsTotal: 30,
      tag: "Backend",
    },
  ];

  return (
    <div className="w-screen max-w-none min-h-screen bg-white overflow-x-hidden">
      {/* Header chung */}
      <Header />

      {/* Banner + Profile */}
      <section className="w-full px-6 lg:px-12 py-10">
        {/* Cover */}
        <div className="w-full h-28 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden mb-10">
          <div className="absolute inset-0 opacity-30">
            <div className="w-40 h-40 bg-white/20 rounded-full blur-2xl -left-8 -top-10 absolute" />
            <div className="w-52 h-52 bg-white/10 rounded-full blur-2xl right-20 -bottom-12 absolute" />
          </div>
          <div className="absolute -bottom-10 left-6 lg:left-12">
            <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-lg bg-gradient-to-br from-slate-400 to-slate-700 text-white grid place-items-center text-3xl font-bold">
              B
            </div>
          </div>
        </div>

        <div className="pl-6 lg:pl-12">
          <h1 className="text-2xl font-extrabold text-gray-900">billveoth</h1>
          <p className="text-gray-600 text-sm">Trang cá nhân công khai • Học viên lập trình</p>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("courses")}
              className={`pb-4 font-medium text-base transition-colors ${
                activeTab === "courses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Khóa học
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`pb-4 font-medium text-base transition-colors ${
                activeTab === "results"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kết quả luyện tập
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="w-full bg-gray-50">
        <div className="w-full px-6 lg:px-12 py-10">
          {/* RESULTS TAB */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {/* CTA tới trang thống kê */}
              <div className="flex justify-center">
                <Link
                  to="/resultstest"
                  className="px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition font-medium inline-flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Tới trang thống kê kết quả
                </Link>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Trophy className="w-4 h-4" />
                    Tổng bài đã làm
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900">{codingResults.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Code2 className="w-4 h-4" />
                    Chủ đề gần đây
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {codingResults[0]?.tag || "—"}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    Lần gần nhất
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {codingResults[0]?.date || "—"}
                  </p>
                </div>
              </div>

              {/* List results */}
              <div className="space-y-4">
                {codingResults.map((r) => (
                  <article
                    key={r.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                            <Code2 className="w-3.5 h-3.5" />
                            {r.tag}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                            {r.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-600 text-sm mb-1">Ngày làm</p>
                            <p className="text-gray-900 font-medium">{r.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm mb-1">Kết quả</p>
                            <p className="text-gray-900 font-medium">
                              {r.scoreText} (Điểm: {typeof r.totalScore === "number" ? `${r.totalScore}%` : r.totalScore})
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm mb-1">Thời gian</p>
                            <p className="text-gray-900 font-medium">{r.duration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/results/${r.id}`}
                          className="px-5 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition whitespace-nowrap"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-700">Bạn chưa đăng ký khóa học nào</p>
                  <Link
                    to="/courses"
                    className="mt-4 inline-block px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
                  >
                    Khám phá khóa học
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((c) => (
                    <article
                      key={c.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 mb-1">{c.tag}</div>
                          <h3 className="text-lg font-bold text-gray-900 truncate">{c.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {c.lessonsDone}/{c.lessonsTotal} bài học
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {c.progress}%
                        </span>
                      </div>

                      <div className="mt-4 h-2 w-full bg-gray-100 rounded">
                        <div
                          className="h-2 bg-blue-600 rounded"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>

                      <div className="mt-5 flex gap-3">
                        <Link
                          to={`/courses/${c.id}`}
                          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-medium"
                        >
                          Xem chi tiết
                        </Link>
                        <Link
                          to={`/learning/${c.id}`}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                        >
                          Tiếp tục học
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer chung */}
      <Footer />
    </div>
  );
}
