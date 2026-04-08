"use client";

import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./store/auth";
import Menu from "./pages/shared/MenuS.jsx";

// Route Guards & Auth
import PrivateRoute from "./components/auth/PrivateRoute";
import RequireRole from "./components/auth/RequireRole";

// Error PagesBlog
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";
import NotFoundPage from "./pages/errors/NotFound";

// UI Providers
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";

/* ====== Lazy-loaded Pages ====== */
const Home = lazy(() => import("./pages/shared/Home/Home.jsx"));
const Discover = lazy(() => import("./pages/shared/Discover/Discover.jsx"));
const Courses = lazy(() => import("./pages/shared/Courses/Courses.jsx"));
const CourseDetail = lazy(() => import("./pages/shared/CourseDetail/CourseDetail.jsx"));
const About = lazy(() => import("./pages/shared/About/About.jsx"));
const Membership = lazy(() => import("./pages/shared/MemberShip.jsx"));
const Payment = lazy(() => import("./pages/shared/Payment/Payment.jsx"));
const Menut = lazy(() => import("./pages/shared/Menut.jsx"));

const Login = lazy(() => import("./pages/shared/Login/Login.jsx"));
const Register = lazy(() => import("./pages/shared/Register/Register.jsx"));


const Discussion = lazy(() => import("./pages/Discussion.jsx"));
const DiscussionDetail = lazy(() => import("./pages/DiscussionDetail.jsx"));
const ClassRoom = lazy(() => import("./pages/ClassRoom.jsx"));

// Blog-related pages
const Blog = lazy(() => import("./pages/shared/Blog/index.js"));
const BlogDetail = lazy(() => import("./pages/shared/BlogDetail/BlogDetail.jsx"));
const BlogSearch = lazy(() => import("./pages/shared/BlogSearch/BlogSearch.jsx"));
const BlogAuthor = lazy(() => import("./pages/shared/BlogAuthor/BlogAuthor.jsx"));
const BlogMy = lazy(() => import("./pages/shared/BlogMy/BlogMy.jsx"));
const BlogEditor = lazy(() => import("./pages/shared/BlogEditor/BlogEditor.jsx"));
const Rankings = lazy(() => import("./pages/shared/Rankings"));
const PublicProfile = lazy(() => import("./pages/shared/PublicProfile"));

// Exam pages
const Study4TestLibrary = lazy(() => import("./pages/shared/Exam/Exam.jsx"));
const ExamDetail = lazy(() => import("./pages/shared/ExamDetail/ExamDetail.jsx"));

const Dashboard = lazy(() => import("./pages/student/DashBoard.jsx"));
const HistoryTest = lazy(() => import("./pages/student/HistoryTest.jsx"));
const QuizTest = lazy(() => import("./pages/student/DoingExam/QuizTest.jsx"));
const Learning = lazy(() => import("./pages/student/Learning.jsx"));
const Enrollments = lazy(() => import("./pages/student/Enrollments/Enrollments.jsx"));
const LessonDetail = lazy(() => import("./pages/student/LessonDetail/LessonDetail.jsx"));
const ResultAttempt = lazy(() => import("./pages/student/ResultExamAttempt/ResultAttempt.jsx"));
const ProfilePage = lazy(() => import("./pages/student/Profile.jsx"));
const SchedulePage = lazy(() => import("./pages/student/SchedulePage.jsx"));
const PaymentHistory = lazy(() => import("./pages/student/PaymentHistory.jsx"));

const InstructorDashboard = lazy(() => import("./pages/instructor/Dashboard/Dashboard.jsx"));
const InstructorCourses = lazy(() => import("./pages/instructor/MyCourse/MyCourses.jsx"));
const CourseLessons = lazy(() => import("./pages/instructor/CourseLessons.jsx"));
const Exams = lazy(() => import("./pages/instructor/Exams.jsx"));
const CourseCreate = lazy(() => import("./pages/instructor/CreateCourse/CreateCourse.jsx"));
const CourseEdit = lazy(() => import("./pages/instructor/CourseEdit/CourseEdit.jsx"));
const CourseStudents = lazy(() => import("./pages/instructor/CourseStudents.jsx"));
const StudentProgress = lazy(() => import("./pages/instructor/StudentProgress.jsx"));
const CourseReviews = lazy(() => import("./pages/instructor/CourseReviews.jsx"));
const ExamCreate = lazy(() => import("./pages/instructor/CreateExam/CreateExam.jsx"));
const ExamEdit = lazy(() => import("./pages/instructor/ExamEdit.jsx"));
const ExamStats = lazy(() => import("./pages/instructor/ExamStats.jsx"));
const ExamAttempts = lazy(() => import("./pages/instructor/ExamAttempts.jsx"));
const CourseExams = lazy(() => import("./pages/instructor/CourseExams/CourseExams.jsx"));

// Forum pages
const ForumHome = lazy(() => import("./pages/shared/Forum").then(m => ({ default: m.ForumHome })));
const QuestionDetail = lazy(() => import("./pages/shared/Forum").then(m => ({ default: m.QuestionDetail })));
const AskQuestion = lazy(() => import("./pages/shared/Forum").then(m => ({ default: m.AskQuestion })));
const EditQuestion = lazy(() => import("./pages/shared/Forum").then(m => ({ default: m.EditQuestion })));
const MyQuestions = lazy(() => import("./pages/shared/Forum").then(m => ({ default: m.MyQuestions })));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin/AdminLogin.jsx"));
const Reports = lazy(() => import("./pages/admin/Reports/Reports.jsx"));


const BecomeInstructor = lazy(() => import("./pages/shared/BecomInstructor/index.js"));

import LessonUpload from "./pages/instructor/LessonUpload.jsx";
import Categories from "./pages/instructor/Categories.jsx";
import CategoryCreate from "./pages/instructor/CategoryCreate.jsx";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import CourseApprovals from "./pages/admin/CourseApprovals/CourseApprovals.jsx";

// Test page
import TestComponents from "./pages/TestComponents.jsx";

import Layout from "./components/Layout.jsx";

function Loader() {
  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center text-slate-500">
      Đang tải…
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-semibold text-slate-800">404 – Không tìm thấy trang</h1>
      <a href="/" className="mt-6 inline-flex items-center rounded-lg px-4 py-2 border hover:bg-slate-50">
        Về trang chủ
      </a>
    </div>
  );
}

export default function App() {
  const { hydrate } = useAuth();
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen w-screen bg-white flex flex-col">
            <main className="flex-1">
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* ========== PUBLIC ROUTES ========== */}
                  <Route element={<Layout />}>

                    <Route index element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/u/:id" element={<PublicProfile />} />
                    <Route path="/forum" element={<ForumHome />} />
                    <Route path="/forum/:id" element={<QuestionDetail />} />
                     <Route path="/i/become-instructor" element={<BecomeInstructor title="🧾 /i/become-instructor — Đăng ký giảng viên" />} />

                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/search" element={<BlogSearch />} />
                    <Route path="/blog/author/:memberId" element={<BlogAuthor />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />

                    <Route path="/i/become-instructor" element={<BecomeInstructor title="🧾 /i/become-instructor — Đăng ký giảng viên" />} />

                    {/* Student */}
                    <Route element={<RequireRole roles={["Student"]} />}>
                      <Route path="/s/enrollments" element={<Enrollments title="📚 /s/enrollments — Khóa học của tôi" />} />
                      <Route path="/s/:courseContentId/lesson/:lessonId" element={<LessonDetail title="📖 /s/lesson/:lessonId — Chi tiết bài học" />} />
                      <Route path="/s/exam/:id" element={<ExamDetail title="🧠 /s/exam/:id — Giới thiệu đề thi (CTA Bắt đầu thi)" />} />
                      <Route path="/s/exam/:id/take-exam" element={<QuizTest />} />
                      <Route path="/s/results/:attemptId" element={<ResultAttempt title="📈 /s/results/:attemptId — Kết quả bài thi" />} />
                    </Route>

                    {/* Teacher */}
                    <Route element={<RequireRole roles={["Teacher"]} />}>
                      <Route path="/i/dashboard" element={<InstructorDashboard title="📊 /i/dashboard — Tổng quan giảng viên" />} />
                      <Route path="/i/courses/new" element={<CourseCreate title="🆕 /i/courses/new — Tạo khoá draft" />} />
                      <Route path="/i/courses" element={<InstructorCourses title="📚 /i/courses — Khoá học đã tạo" />} />
                      <Route path="/i/courses/:id/edit" element={<CourseEdit title="✏️ /i/courses/:id/edit — Sửa khoá (draft/version)" />} />
                      <Route path="/i/courses/:courseId/exams" element={<CourseExams title="🧠 /i/courses/:courseId/exams — Quản lý bài kiểm tra" />} />
                      <Route path="/i/courses/:courseId/exams/create" element={<ExamCreate title="🆕 /i/courses/:courseId/exams/create — Tạo đề thi" />} />

                    </Route>

                  </Route>

                  <Route element={<RequireRole roles={["Admin"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="courses" element={<CourseApprovals />} />
                      <Route path="reports" element={<Reports />} />
                    </Route>
                  </Route>

                  
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* <Route index element={<Home />} /> */}
                  <Route path="/menut" element={<Menut />} />
                  <Route path="/menuS" element={<Menu />} />
                  <Route path="/discover" element={<Discover />} />

                  <Route path="/exam" element={<Study4TestLibrary />} />
                  <Route path="/exam/:id" element={<ExamDetail />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />






                  <Route path="/about" element={<About />} />
                  <Route path="/membership" element={<Membership />} />
                  <Route path="/payment" element={<Payment />} />

                  <Route path="/discussion" element={<Discussion />} />
                  <Route path="/discussion/:id" element={<DiscussionDetail />} />
                  <Route path="/class/:id" element={<ClassRoom />} />
                  <Route path="/schedule" element={<SchedulePage />} />

                  {/* Test UI Components */}
                  <Route path="/test-ui" element={<TestComponents />} />

                  {/* ========== AUTH-ONLY ROUTES (no role restriction) ========== */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/blog/new" element={<BlogEditor mode="create" />} />
                    <Route path="/blog/:id/edit" element={<BlogEditor mode="edit" />} />
                    <Route path="/blog/my" element={<BlogMy />} />
                    <Route path="/forum/new" element={<AskQuestion />} />
                    <Route path="/forum/:id/edit" element={<EditQuestion />} />
                    <Route path="/forum/my" element={<MyQuestions />} />
                    
                  </Route>

                  {/* ========== PROTECTED: STUDENT ROUTES (/s/*) ========== */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<RequireRole roles={["Student"]} />}>
                      <Route path="/s/dashboard" element={<Dashboard />} />

                      <Route path="/s/historytest" element={<HistoryTest />} />
                      <Route path="/s/profile" element={<ProfilePage title="👤 /s/profile — Hồ sơ & cài đặt" />} />
                      <Route path="/s/schedulepage" element={<SchedulePage />} />
                      <Route path="/s/payment-history" element={<PaymentHistory />} />
                    </Route>
                  </Route>

                  {/* ========== PROTECTED: INSTRUCTOR ROUTES (/i/*) ========== */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<RequireRole roles={["Teacher"]} />}>

                      <Route path="/i/courses" element={<InstructorCourses title="📚 /i/courses — Khoá học đã tạo" />} />


                      <Route path="/i/courses/:id/lessons" element={<CourseLessons title="🧱 /i/courses/:id/lessons — CRUD bài học" />} />
                      <Route path="/i/courses/:id/students" element={<CourseStudents title="👥 /i/courses/:id/students — Danh sách học viên" />} />
                      <Route path="/i/courses/:id/students/:userId" element={<StudentProgress title="👤 /i/courses/:id/students/:userId — Tiến độ 1 học viên" />} />
                      <Route path="/i/courses/:id/reviews" element={<CourseReviews title="⭐ /i/courses/:id/reviews — Quản lý đánh giá" />} />
                      <Route path="/i/exams" element={<Exams title="🧠 /i/exams — Đề thi do GV tạo" />} />

                      <Route path="/i/exams/:id/edit" element={<ExamEdit title="✏️ /i/exams/:id/edit — Chỉnh sửa đề (draft)" />} />
                      <Route path="/i/exams/:id/stats" element={<ExamStats title="📈 /i/exams/:id/stats — Thống kê đề thi (Item analysis)" />} />
                      <Route path="/i/exams/:id/attempts" element={<ExamAttempts title="🧾 /i/exams/:id/attempts — Lượt làm & chi tiết" />} />

                      <Route path="/i/courses/:courseId/lessons/:lessonId/upload" element={<LessonUpload />} />
                      <Route path="/i/categories" element={<Categories />} />
                      <Route path="/i/categories/new" element={<CategoryCreate />} />
                    </Route>
                  </Route>

                  {/* ========== PROTECTED: ADMIN ROUTES (/admin/*) ========== */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<RequireRole roles={["Admin"]} />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        
                      </Route>
                    </Route>
                  </Route>

                  {/* ========== LEGACY ROUTES ========== */}
                  <Route path="/exam/:id/start/:attemptId" element={<QuizTest />} />

                  {/* ========== ERROR ROUTES ========== */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/forbidden" element={<Forbidden />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
