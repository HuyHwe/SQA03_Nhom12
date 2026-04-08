// // src/pages/student/Learning.jsx
// "use client";

// import { useState } from "react";
// import { Play, Star } from "lucide-react";
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";

// export default function Learning() {
//   const [currentLesson, setCurrentLesson] = useState(0);

//   // ===== Dữ liệu khoá học lập trình (đã Việt hoá)
//   const lessons = [
//     { id: 1, title: "Bài 01: Giới thiệu khoá học & môi trường làm việc", duration: "30 phút", type: "video",
//       desc: "Tổng quan nội dung, mục tiêu học tập và cách cài đặt môi trường (Node.js, IDE, tiện ích)."
//     },
//     { id: 2, title: "Bài 02: Bắt đầu với JavaScript hiện đại (ES6+)", duration: "35 phút", type: "video",
//       desc: "Biến, hằng, arrow function, destructuring, template string và module."
//     },
//     { id: 3, title: "Bài 03: Làm việc với DOM & sự kiện", duration: "32 phút", type: "video",
//       desc: "Query DOM, lắng nghe sự kiện, thao tác class, tối ưu render."
//     },
//     { id: 4, title: "Mini Quiz 01: Ôn tập nền tảng JS", duration: "15 phút", type: "quiz",
//       desc: "Bài trắc nghiệm giúp bạn tự kiểm tra kiến thức đã học."
//     },
//     { id: 5, title: "Bài 04: React cơ bản – Component & Props", duration: "40 phút", type: "video",
//       desc: "Tư duy component, props, JSX và tổ chức mã nguồn."
//     },
//     { id: 6, title: "Bài 05: React State & Hooks phổ biến", duration: "38 phút", type: "video",
//       desc: "useState, useEffect, quy tắc hooks và side effects thường gặp."
//     },
//     { id: 7, title: "Bài 06: Quản lý form & xác thực", duration: "33 phút", type: "video",
//       desc: "Xây form, kiểm tra dữ liệu đầu vào, UX khi submit."
//     },
//     { id: 8, title: "Bài 07: Gọi API & xử lý bất đồng bộ", duration: "36 phút", type: "video",
//       desc: "fetch/axios, loading/error state, phân trang và tìm kiếm."
//     },
//     { id: 9, title: "Bài 08: Dự án nhỏ – Ứng dụng Ghi chú", duration: "60 phút", type: "video",
//       desc: "Dự án thực hành: CRUD ghi chú, lưu localStorage, tách component."
//     },
//     { id: 10, title: "Mini Quiz 02: Ôn tập React", duration: "20 phút", type: "quiz",
//       desc: "Củng cố kiến thức trọng tâm phần React."
//     },
//   ];

//   const reviews = [
//     {
//       name: "Nguyễn Minh Đức",
//       rating: 5,
//       text: "Khoá học rất dễ hiểu, ví dụ thực tế. Mình từ con số 0 đã làm được app ghi chú trong một buổi tối.",
//     },
//     {
//       name: "Lina Trần",
//       rating: 5,
//       text: "Giải thích cặn kẽ, lộ trình hợp lý. Phần React hooks và quản lý form cực kỳ hữu ích cho dự án của mình.",
//     },
//     {
//       name: "Phạm Hoàng",
//       rating: 4,
//       text: "Nội dung chắc, có bài tập nhỏ sau mỗi phần. Nếu thêm phần TypeScript cơ bản nữa thì tuyệt vời.",
//     },
//   ];

//   const relatedCourses = [
//     {
//       id: 1,
//       title: "Web Frontend từ A–Z (HTML/CSS/JS)",
//       duration: "3 tháng",
//       category: "Frontend",
//       instructor: "P Elearning Team",
//       price: 1_200_000,
//       discount: 890_000,
//     },
//     {
//       id: 2,
//       title: "React + Vite + Tailwind Thực Chiến",
//       duration: "2.5 tháng",
//       category: "React",
//       instructor: "P Elearning Team",
//       price: 1_100_000,
//       discount: 840_000,
//     },
//     {
//       id: 3,
//       title: "Node.js & REST API căn bản",
//       duration: "2 tháng",
//       category: "Backend",
//       instructor: "P Elearning Team",
//       price: 990_000,
//       discount: 760_000,
//     },
//     {
//       id: 4,
//       title: "Git/GitHub chuyên sâu cho Dev",
//       duration: "1 tháng",
//       category: "Tooling",
//       instructor: "P Elearning Team",
//       price: 590_000,
//       discount: 450_000,
//     },
//   ];

//   const current = lessons[currentLesson] ?? lessons[0];

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <Header />

//       {/* Main Content */}
//       <div className="w-full flex">
//         {/* Sidebar bài học */}
//         <aside className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-80px)]">
//           <div className="p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-1">Lộ trình phát triển Web hiện đại</h2>
//             <p className="text-sm text-gray-600 mb-6">JavaScript → React → Dự án thực tế</p>

//             <div className="space-y-2">
//               {lessons.map((lesson, index) => (
//                 <button
//                   key={lesson.id}
//                   onClick={() => setCurrentLesson(index)}
//                   className={`w-full text-left p-3 rounded-lg transition-colors ${
//                     currentLesson === index
//                       ? "bg-blue-100 text-blue-600"
//                       : "hover:bg-gray-100 text-gray-700"
//                   }`}
//                   type="button"
//                 >
//                   <div className="flex items-start gap-2">
//                     <Play size={16} className="mt-1 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium">{lesson.title}</p>
//                       <p className="text-xs text-gray-500">{lesson.duration}</p>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </aside>

//         {/* Khu vực chính */}
//         <main className="flex-1 overflow-y-auto max-h-[calc(100vh-80px)]">
//           {/* Player (mock) */}
//           <div className="w-full bg-black aspect-video flex items-center justify-center">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Play size={40} className="text-white fill-white" />
//               </div>
//               <p className="text-white text-sm">00:05 / 03:26</p>
//             </div>
//           </div>

//           {/* Thông tin bài học hiện tại */}
//           <div className="p-8 border-b border-gray-200">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h1>
//                 <p className="text-gray-600">{current.duration}</p>
//               </div>
//               <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
//                 Hoàn thành để nhận chứng chỉ
//               </div>
//             </div>
//             <p className="text-gray-700 leading-relaxed">
//               {current.desc}
//             </p>
//           </div>

//           {/* Nội dung khoá học */}
//           <div className="p-8 space-y-8">
//             {/* Đối tượng phù hợp */}
//             <section>
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Khoá học phù hợp với ai?</h2>
//               <p className="text-gray-700 leading-relaxed">
//                 • Người mới bắt đầu muốn học lập trình Web theo lộ trình rõ ràng. <br />
//                 • Lập trình viên muốn củng cố nền tảng JavaScript/React để làm dự án thực tế. <br />
//                 • Sinh viên, người chuyển ngành cần portfolio nhanh gọn, có hướng dẫn từng bước.
//               </p>
//             </section>

//             {/* Kết quả đạt được */}
//             <section>
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Bạn sẽ đạt được gì?</h2>
//               <p className="text-gray-700 leading-relaxed">
//                 • Nắm vững JS hiện đại, hiểu cách React hoạt động và tổ chức component. <br />
//                 • Thành thạo gọi API, quản lý trạng thái, xây dựng form & xác thực. <br />
//                 • Tự tay hoàn thiện 1 mini project (Ghi chú) và nền tảng để tiến tới dự án lớn hơn.
//               </p>
//             </section>

//             {/* Giảng viên */}
//             <section>
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Giảng viên</h2>
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 bg-gray-300 rounded-full" />
//                 <div>
//                   <p className="font-bold text-gray-900">P Elearning Instructors</p>
//                   <p className="text-sm text-gray-600">Frontend/Full-stack Engineer · Mentor dự án</p>
//                 </div>
//               </div>
//             </section>

//             {/* Đánh giá học viên */}
//             <section>
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh giá của học viên</h2>
//               <div className="space-y-4">
//                 {reviews.map((review, index) => (
//                   <div key={index} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center gap-2 mb-2">
//                       <p className="font-bold text-gray-900">{review.name}</p>
//                       <div className="flex gap-1">
//                         {[...Array(review.rating)].map((_, i) => (
//                           <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
//                         ))}
//                       </div>
//                     </div>
//                     <p className="text-gray-700 text-sm">{review.text}</p>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Khoá học liên quan */}
//             <section>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold text-gray-900">Học viên cũng mua</h2>
//                 <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                   Xem tất cả
//                 </a>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {relatedCourses.map((course) => (
//                   <div
//                     key={course.id}
//                     className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
//                   >
//                     <div className="w-full h-40 bg-gray-300" />
//                     <div className="p-4">
//                       <p className="text-xs text-gray-500 mb-1">{course.category}</p>
//                       <p className="font-bold text-gray-900 text-sm mb-2">{course.title}</p>
//                       <p className="text-xs text-gray-600 mb-1">{course.duration}</p>
//                       <p className="text-xs text-gray-600 mb-3">Giảng viên: {course.instructor}</p>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-bold text-gray-900">
//                           {course.discount.toLocaleString()}đ
//                         </span>
//                         <span className="text-sm text-gray-500 line-through">
//                           {course.price.toLocaleString()}đ
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </div>
//         </main>
//       </div>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// }
































// src/pages/student/Learning.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Play, Star } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/* ===== API base ===== */
const API_BASE = "http://localhost:5102/api/courses";

/* ===== Component ===== */
export default function Learning() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ========== Load lessons + metadata ========== */
  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError("");

        // 1️⃣ Lấy danh sách bài học
        const resLessons = await fetch(`${API_BASE}/${courseId}/lessons`, { signal: ac.signal });
        if (!resLessons.ok) throw new Error(`HTTP ${resLessons.status}`);
        const dataLessons = await resLessons.json();
        setLessons(Array.isArray(dataLessons) ? dataLessons : []);

        // 2️⃣ Lấy đánh giá
        const resReviews = await fetch(`${API_BASE}/${courseId}/reviews`, { signal: ac.signal });
        if (resReviews.ok) setReviews(await resReviews.json());

        // 3️⃣ Lấy khóa học liên quan
        const resRelated = await fetch(`${API_BASE}/${courseId}/related`, { signal: ac.signal });
        if (resRelated.ok) setRelated(await resRelated.json());

        // 4️⃣ Đặt bài học hiện tại mặc định
        if (dataLessons?.length > 0) setCurrent(dataLessons[0]);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Không tải được dữ liệu khóa học. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (courseId) load();
    return () => ac.abort();
  }, [courseId]);

  /* ========== Cập nhật tiến độ học ========== */
  const markProgress = useCallback(async (lessonId) => {
    try {
      await fetch(`http://localhost:5102/api/lessons/${lessonId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
    } catch (e) {
      console.warn("Không cập nhật được tiến độ:", e);
    }
  }, []);

  /* ========== Xử lý đổi bài học ========== */
  const handleChangeLesson = (lesson) => {
    setCurrent(lesson);
    markProgress(lesson.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 h-[400px] bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-[400px] bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-3xl mx-auto my-10 border border-red-200 bg-red-50 text-red-700 p-6 rounded-2xl text-center">
          {error}
        </div>
        <Footer />
      </div>
    );
  }

  const currentLesson = current || lessons[0];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="w-full flex">
        {/* SIDEBAR: Danh sách bài học */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Lộ trình khóa học</h2>
            <p className="text-sm text-gray-600 mb-6">
              {lessons.length} bài học
            </p>

            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => handleChangeLesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentLesson?.id === lesson.id
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Play size={16} className="mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration || "—"}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Player hoặc nội dung bài học */}
          <div className="w-full bg-black aspect-video flex items-center justify-center">
            {currentLesson?.videoUrl ? (
              <video
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-white">
                <Play size={40} className="mx-auto mb-2" />
                <p>Không có video cho bài học này</p>
              </div>
            )}
          </div>

          {/* THÔNG TIN BÀI HỌC */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLesson?.title}
                </h1>
                <p className="text-gray-600">{currentLesson?.duration || "—"}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
                Hoàn thành để nhận chứng chỉ
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {currentLesson?.description || "Chưa có mô tả cho bài học này."}
            </p>
          </div>

          {/* ĐÁNH GIÁ HỌC VIÊN */}
          <div className="p-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh giá học viên</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-gray-900">{r.studentName}</p>
                        <div className="flex gap-1">
                          {Array.from({ length: Math.round(r.rating || 0) }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Chưa có đánh giá nào.</p>
              )}
            </section>

            {/* KHÓA HỌC LIÊN QUAN */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Khóa học liên quan</h2>
                <a href="/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Xem tất cả
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(related.length > 0 ? related : []).map((c) => (
                  <div
                    key={c.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full h-40 bg-gray-100">
                      {c.thumbnailUrl ? (
                        <img
                          src={c.thumbnailUrl}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="grid place-items-center h-full text-gray-400 text-sm">
                          Ảnh khóa học
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{c.categoryName}</p>
                      <p className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">Giảng viên: {c.teacherName}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {(c.discountPrice ?? c.price)?.toLocaleString("vi-VN")}đ
                        </span>
                        {c.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {c.price?.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
