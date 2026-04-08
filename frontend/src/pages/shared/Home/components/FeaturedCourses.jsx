// src/pages/shared/Home/components/FeaturedCourses.jsx
import { Link } from "react-router-dom";
import { PRIMARY, PRIMARY_HOVER, BORDER } from "../utils/constants";

import fallbackImage from "../../../../assets/images/fallback-image.jpeg";

export default function FeaturedCourses({ courses = [], loading = false, error = null, onNavigate }) {
    return (
        <section className="w-full px-6 lg:px-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl lg:text-2xl font-extrabold text-[#1a1a1a]">Khóa học nổi bật</h2>
                <Link to="/courses" className="text-sm font-semibold" style={{ color: PRIMARY }}>
                    Xem tất cả
                </Link>
            </div>

            {error && (
                <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
                    Không thể tải khoá học (chi tiết: {error})
                </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                {(loading && courses.length === 0 ? Array.from({ length: 4 }) : courses).map((c, idx) => (
                    <article
                        key={c?.id ?? idx}
                        className="min-w-[280px] max-w-[320px] bg-white border rounded-2xl overflow-hidden hover:shadow-sm transition flex flex-col snap-start"
                        style={{ borderColor: BORDER }}
                    >
                        <div className="w-full h-40 bg-gray-100">
                            <img
                                src={c?.thumb || fallbackImage}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => e.currentTarget.src = fallbackImage}
                            />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-[#1a1a1a] line-clamp-2">{c?.title || "—"}</h3>
                            <p className="text-sm text-[#677788] mt-1 line-clamp-3">{c?.desc || ""}</p>
                            {/* <div className="mt-2 text-xs text-[#677788]">
                                Bài học: <b>{c?.lessons ?? "—"}</b> • Cấp độ: {c?.level ?? "—"}
                            </div> */}
                            <br />
                            <button
                                onClick={() => onNavigate(`/courses/${c?.id}`)}
                                className="mt-auto w-full rounded-lg text-white py-2 font-medium transition"
                                style={{ backgroundColor: PRIMARY }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                                type="button"
                                disabled={!c}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
