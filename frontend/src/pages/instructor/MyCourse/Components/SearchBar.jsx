import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Primary } from "../../../../components/Buttons";

function SearchBar({ q, setQ, status, setStatus, sort, setsort, handleSearch }) {
    return (
        <div className="rounded-2xl border bg-white p-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
                <input
                    value={q}
                    onChange={(e) => {setQ(e.target.value) }}
                    placeholder="Tìm theo tên khoá…"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="">Trạng thái: Tất cả</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
                <select
                    value={sort}
                    onChange={(e) => setsort(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="time-desc">Mới cập nhật</option>
                    <option value="time-asc">Cũ nhất</option>
                    <option value="alphabet-asc">Tên A → Z</option>
                    <option value="alphabet-desc">Tên Z → A</option>
                    <option value="popular-desc">Ghi danh ↓</option>
                    <option value="popular-asc">Ghi danh ↑</option>
                </select>
            </div>

            <Primary onClick={handleSearch}>Tìm kiếm</Primary>
        </div>
    )
}

export default SearchBar;