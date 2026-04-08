// src/pages/shared/BlogMy/Components/MyBlogHero.jsx
import { useNavigate } from "react-router-dom";

const BRAND = { primary: "#2563eb", primaryHover: "#1d4ed8" };

export default function MyBlogHero({ showDeleted, setShowDeleted }) {
    const navigate = useNavigate();

    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Bài viết của tôi
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Quản lý tất cả bài viết của bạn
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                className="accent-blue-600"
                                checked={showDeleted}
                                onChange={(e) => setShowDeleted(e.target.checked)}
                            />
                            Hiện bài đã xoá
                        </label>
                        <button
                            onClick={() => navigate("/blog/new")}
                            className="rounded-full text-white px-4 py-2 text-sm font-semibold transition"
                            style={{ backgroundColor: BRAND.primary }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.primaryHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.primary)}
                        >
                            + Viết bài mới
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
