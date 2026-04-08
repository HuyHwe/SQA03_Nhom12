// src/pages/shared/Discover/Components/SearchFilters.jsx
import { Search } from "lucide-react";

export default function SearchFilters({ search, setSearch, topic, setTopic, topics }) {
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 pb-8">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative md:flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm khóa học, chủ đề, kỹ năng..."
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-11 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex gap-2 overflow-auto">
                        {topics.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTopic(t.id)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${topic === t.id
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
