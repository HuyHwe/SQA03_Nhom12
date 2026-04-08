import { Primary } from "../../../../components/Buttons";

function SearchBar( { query, setQuery, selectedCategory, setSelectedCategory, categories, handleSearch }) {
    return (
        <section id="filters" className="bg-white border-b py-6">
            <div className="flex flex-col md:flex-row items-center gap-3 py-4 px-6 lg:px-12">
                <input
                    type="text"
                    placeholder="Tìm khóa học theo tên, danh mục..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-xl border px-3 py-2"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c, i) => (
                    <option key={i} value={c.id}>
                        {c.name}
                    </option>
                    ))}
                </select>
                <Primary onClick={handleSearch}>Tìm kiếm</Primary>
            </div>
        </section>
    )
}

export default SearchBar;