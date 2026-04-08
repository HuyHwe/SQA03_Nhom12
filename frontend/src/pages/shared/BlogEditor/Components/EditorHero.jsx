// src/pages/shared/BlogEditor/Components/EditorHero.jsx
import { Link } from "react-router-dom";

const BRAND = { primary: "#2563eb", primaryHover: "#1d4ed8" };

export default function EditorHero({ mode, canSubmit, saving, onSave }) {
    const title = mode === "create" ? "Tạo bài viết mới" : "Chỉnh sửa bài viết";

    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {title}
                        </h1>
                        <p className="text-slate-600 mt-2">
                            {mode === "create" ? "Tạo bài viết mới và chia sẻ kiến thức" : "Chỉnh sửa nội dung bài viết"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/blog/my"
                            className="rounded-full border px-4 py-2 text-sm hover:bg-white"
                        >
                            ← Quay lại "Bài viết của tôi"
                        </Link>
                        <button
                            onClick={onSave}
                            disabled={!canSubmit || saving}
                            className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            style={{ backgroundColor: BRAND.primary }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.primaryHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.primary)}
                        >
                            {saving ? "Đang lưu…" : mode === "create" ? "Xuất bản" : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
