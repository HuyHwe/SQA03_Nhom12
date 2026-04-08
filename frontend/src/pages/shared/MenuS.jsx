"use client";

import { Link } from "react-router-dom";

const pages = [
  // === CORE PAGES ===
  { label: "🏠 Trang chủ", path: "/" },
  { label: "📘 Khoá học", path: "/courses" },
  { label: "📗 Chi tiết khoá học", path: "/courses/1" },
  { label: "💬 Thảo luận", path: "/discussion" },
  { label: "🧭 Dashboard", path: "/dashboard" },
  { label: "🧭 Học onl", path: "/learning" },
  { label: "🧭 Khám phá", path: "/discover" },
  { label: "🧭 Lịch sử làm đề thi", path: "/historytest" },

  // === AUTH ===
  { label: "🔑 Login", path: "/login" },
  { label: "🆕 Register", path: "/register" },

  // === BLOG & STATIC ===
  { label: "📰 Blog", path: "/blog" },
  { label: "🧩 Blog Chi tiết", path: "/blog/1" },
  { label: "ℹ️ About", path: "/about" },
  { label: "💎 Membership", path: "/membership" },
  { label: "💳 Thanh toán", path: "/payment" },
  { label: "🧭 QuizTest", path: "/quiztest" },
  { label: "ℹ️ Lịch học", path: "/schedule" },
  { label: "🧭 Kết quả làm đề thi", path: "/resultstest" },

  // === TEST / EXAM ===
  { label: "🧠 Thư viện đề thi", path: "/exam" },
  { label: "🧠 Chi tiết đề thi", path: "/exam/1" },
  { label: "📈 IELTS Results Page", path: "/test" },
];

export default function Menu() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-16 px-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
          🔍 E-Learning PTIT — Page Test Menu
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              className="flex items-center justify-between px-5 py-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white transition shadow-sm"
            >
              <span className="font-medium">{p.label}</span>
              <span className="text-sm opacity-70">{p.path}</span>
            </Link>
          ))}
        </div>

        <p className="text-sm text-center text-gray-500 mt-8">
          Tip: Dùng trang này để kiểm tra routing, header, auth & layout toàn bộ hệ thống.
        </p>
      </div>
    </section>
  );
}
