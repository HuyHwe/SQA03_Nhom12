// src/pages/shared/BlogAuthor/Components/AuthorHero.jsx
import { Link } from "react-router-dom";

export default function AuthorHero({ authorName, postCount, loading }) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-6">
                <div className="mb-4">
                    <div className="text-sm text-slate-500">
                        <Link to="/blog" className="hover:underline">Blog</Link> / Tác giả
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Tác giả: {authorName}
                    </h1>
                    <p className="text-slate-600 mt-2">
                        {loading ? "Đang tải..." : `Có ${postCount} bài viết`}
                    </p>
                </div>
            </div>
        </section>
    );
}
