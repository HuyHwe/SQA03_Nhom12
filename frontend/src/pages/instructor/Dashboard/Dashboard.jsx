"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, Star, Plus,
  Edit, ArrowRight,
  Layers, Globe2, DollarSign
} from "lucide-react";

import { fetchOverviewTeacher } from "../../../api/teacher.api";

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN", { hour12: false });
};

const currency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v * 1000);

export default function InstructorDashboard() {
  const [statistics, setStatistics] = useState({
    totalCourses: 0,
    totalPublishedCourses: 0,
    totalDraftCourses: 0,
    totalPendingCourses: 0,
    totalRejectedCourses: 0,
    totalEnrollments: 0,
    averageRating: 0,
    totalRevenue: 0
  });
  const [topCourses, setTopCourses] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => window.scrollTo(0, 0), []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const result = await fetchOverviewTeacher();
      if (result.data) {
        const { statistics, recentEnrollments, recentReviews, topCourses } = result.data;
        setStatistics(statistics || {});
        setTopCourses(topCourses || []);
        setRecentEnrollments(recentEnrollments?.recentEnrollments || []);
        setRecentReviews(recentReviews?.recentReviews || []);
      }
    } catch (e) {
      console.error("Failed to fetch overview data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="w-full px-6 lg:px-12 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Dashboard giảng viên</h1>
            <p className="text-gray-600">Tổng quan khoá, ghi danh, đánh giá.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/i/courses/new" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tạo khoá mới
            </Link>
            <Link to="/i/courses" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Quản lý khoá
            </Link>
          </div>
        </div>
      </section>

      <main className="w-full px-6 lg:px-12 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-600">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPI icon={<Layers className="w-4 h-4" />} label="Tổng khoá" value={statistics.totalCourses} tone="slate" />
              <KPI icon={<Globe2 className="w-4 h-4" />} label="Published" value={statistics.totalPublishedCourses} tone="emerald" />
              <KPI icon={<Edit className="w-4 h-4" />} label="Draft" value={statistics.totalDraftCourses} tone="amber" />
              <KPI icon={<Users className="w-4 h-4" />} label="Tổng ghi danh" value={statistics.totalEnrollments} tone="blue" />
              <KPI icon={<Star className="w-4 h-4" />} label="Rating TB" value={statistics.averageRating} suffix="/5" tone="violet" />
              <KPI icon={<DollarSign className="w-4 h-4" />} label="Doanh thu" value={currency(statistics.totalRevenue)} tone="emerald" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-8">
              <section className="space-y-6">
                {/* Top courses */}
                <div className="rounded-2xl border bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">Khoá học hàng đầu</div>
                    <Link to="/i/courses" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                      Tất cả <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="divide-y">
                    {topCourses.length > 0 ? (
                      topCourses.map(c => (
                        <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                          <div className="w-28 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {c.thumbnailUrl ? (
                              <img src={c.thumbnailUrl} className="w-full h-full object-cover" alt={c.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <BookOpen className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{c.title}</div>
                            <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3 mt-0.5">
                              <span>{c.categoryName || "Chưa phân loại"}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> {c.enrollmentCount || 0} HV
                              </span>
                              {c.reviewCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5" /> {c.averageRating} ({c.reviewCount})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-sm text-gray-600">Chưa có khoá học nào.</div>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-2xl border bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b text-lg font-bold text-gray-900">Ghi danh gần đây</div>
                  <div className="divide-y">
                    {recentEnrollments.length > 0 ? (
                      recentEnrollments.map((e, idx) => (
                        <div key={e.studentId + e.courseId + idx} className="px-5 py-3 text-sm">
                          <div className="font-medium text-gray-900">{e.studentName}</div>
                          <div className="text-xs text-gray-600">
                            Đăng ký: <Link to={`/courses/${e.courseId}`} className="text-blue-600 hover:text-blue-700">{e.courseName}</Link> • {fmt(e.enrolledAt)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-sm text-gray-600">Chưa có ghi danh mới.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b text-lg font-bold text-gray-900">Đánh giá gần đây</div>
                  <div className="divide-y">
                    {recentReviews.length > 0 ? (
                      recentReviews.map(r => (
                        <div key={r.id} className="px-5 py-3 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{r.studentName}</div>
                            <div className="inline-flex items-center gap-1 text-amber-600">
                              {Array.from({ length: r.rating }, (_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            Về khoá: <Link to={`/courses/${r.courseId}`} className="text-blue-600 hover:text-blue-700">{r.courseTitle}</Link> • {fmt(r.createdAt)}
                          </div>
                          <div className="mt-1 text-gray-800">{r.comment}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-sm text-gray-600">Chưa có đánh giá mới.</div>
                    )}
                  </div>
                </div>
              </aside>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-bold text-gray-900 mb-3">Liên kết nhanh</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <Link to="/i/courses/new" className="rounded-lg border px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tạo khoá mới
                </Link>
                <Link to="/i/courses" className="rounded-lg border px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Danh sách khoá
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KPI({ icon, label, value, suffix = "", tone = "slate" }) {
  const toneMap = {
    slate: "text-slate-700",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    violet: "text-violet-700",
  };
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs text-gray-600 inline-flex items-center gap-2">{icon}{label}</div>
      <div className={`mt-1 text-xl md:text-2xl font-extrabold ${toneMap[tone] || toneMap.slate}`}>
        {value}{suffix}
      </div>
    </div>
  );
}