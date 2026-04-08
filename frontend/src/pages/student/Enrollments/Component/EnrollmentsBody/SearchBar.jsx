import { Primary } from "../../../../../components/Buttons";

function SearchBar({ q, setQ, status, setStatus, sort, setSort, handleSearch }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-3 py-4">
            <div className="flex-1">
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo tên khóa học, danh mục…"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả</option>
                    <option value="active">Đang học</option>
                    <option value="completed">Hoàn thành</option>
                </select>
            </div>

            <div>
                <label className="text-sm text-gray-600">Sắp xếp</label>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Gần đây</option>
                    <option value="progress-desc">% hoàn thành ↓</option>
                    <option value="progress-asc">% hoàn thành ↑</option>
                </select>
            </div>

            <Primary onClick={handleSearch}>Tìm kiếm</Primary>
        </div>
    )
}

export default SearchBar;