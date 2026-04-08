import { Search, Filter } from "lucide-react";

function ExamFilters({
    keyword,
    setKeyword,
    status,
    setStatus,
    sort,
    setSort,
    onSearch
}) {
    return (
        <div className="bg-white rounded-lg border p-4 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài kiểm tra..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={onSearch}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Lọc:</span>
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="opened">Đang mở</option>
                    <option value="closed">Đã đóng</option>
                </select>

                {/* Sort Dropdown */}
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Sắp xếp mặc định</option>
                    <option value="alphabet-asc">Tên A-Z</option>
                    <option value="alphabet-desc">Tên Z-A</option>
                    <option value="time-duration-asc">Thời gian tăng dần</option>
                    <option value="time-duration-desc">Thời gian giảm dần</option>
                    <option value="total-completed-asc">Lượt hoàn thành tăng dần</option>
                    <option value="total-completed-desc">Lượt hoàn thành giảm dần</option>
                </select>
            </div>
        </div>
    );
}

export default ExamFilters;
