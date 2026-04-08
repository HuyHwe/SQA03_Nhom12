// src/pages/shared/BlogSearch/Components/Hero.jsx
export default function Hero({ query, resultCount, loading }) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6">
                <div className="mb-4">
                    <div className="text-sm text-slate-500">
                        <a href="/blog" className="hover:underline">Blog</a> / Tìm kiếm
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Kết quả tìm kiếm cho "{query}"
                    </h1>
                    <p className="text-slate-600 mt-2">
                        {loading ? "Đang tìm..." : `Tìm thấy ${resultCount} kết quả`}
                    </p>
                </div>
            </div>
        </section>
    );
}
