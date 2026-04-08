// src/pages/shared/Exam/Components/SearchBar.jsx
import { Search } from "lucide-react";
import { PRIMARY, PRIMARY_HOVER } from "../utils/examHelpers";

export default function SearchBar({ searchQuery, setSearchQuery, onSearch }) {
    return (
        <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập từ khóa (tiêu đề, mô tả)…"
                    className="w-full px-4 py-2 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none"
                    style={{ borderColor: "#e0e0e0" }}
                />
                <Search size={18} className="absolute right-3 top-2.5 text-[#8c98a4]" />
            </div>
            <button
                className="px-6 py-2 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: PRIMARY }}
                onClick={onSearch}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                type="button"
            >
                Tìm kiếm
            </button>
        </div>
    );
}
