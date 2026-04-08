import SearchBar from "./SearchBar";

function Hero({ q, setQ, status, setStatus, sort, setSort, handleSearch }){
    return (
        <section className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="w-full px-6 lg:px-12 py-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Khóa học của tôi</h1>
                <p className="text-gray-700 mt-1">Xem tiến độ học, tiếp tục bài học và quản lý ghi danh.</p>

                {/* Controls */}
                <SearchBar q={q} setQ={setQ} status={status} setStatus={setStatus} sort={sort} setSort={setSort} handleSearch={handleSearch}/>
            </div>
        </section>
    )
}

export default Hero;