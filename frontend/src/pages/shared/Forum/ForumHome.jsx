// src/pages/shared/Forum/ForumHome.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../../utils/http";
import { API_BASE, BORDER, PRIMARY, PRIMARY_HOVER } from "./utils/constants";
import { isLoggedIn } from "./utils/helpers";
import { SearchBar, QuestionCard } from "./components";
import Pagination from "../Exam/Components/Pagination";

export default function ForumHome() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9); // Lấy 9 items để vừa với grid 3 cột
    const [searchTags, setSearchTags] = useState([]); // State để lưu các tags tìm kiếm
    const [totalRecords, setTotalRecords] = useState(0);

    const totalPages = Math.ceil(totalRecords / pageSize);

    const fetchList = async (currentPage, tags) => {
        // Xây dựng URL với các tham số
        const url = new URL(`${API_BASE}/api/ForumQuestion/paged`);
        url.searchParams.append('page', currentPage);
        url.searchParams.append('pageSize', pageSize);

        // Thêm các tham số tags nếu có
        if (tags && tags.length > 0) {
            tags.forEach(tag => url.searchParams.append('tags', tag));
        }

        const res = await http(url.toString(), {
            headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // API trả về object { items, totalRecords, ... }
        setTotalRecords(data.totalRecords || 0);
        // Dữ liệu câu hỏi nằm trong thuộc tính 'items'
        return Array.isArray(data.items) ? data.items : [];
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const list = await fetchList(page, searchTags); // Truyền tags vào hàm fetch
                if (!mounted) return;
                // Backend đã sắp xếp, không cần sort lại ở client
                setItems(list);
            } catch (e) {
                if (mounted) setErr(e?.message || "Fetch error");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [page, searchTags]); // Chạy lại effect khi 'page' hoặc 'searchTags' thay đổi

    const onSearch = (q) => {
        // Tách chuỗi tìm kiếm thành mảng các tags, loại bỏ khoảng trắng thừa
        const tags = q.split(' ').filter(tag => tag.trim() !== '');
        setSearchTags(tags);
        setPage(1); // Reset về trang 1 khi có tìm kiếm mới
    };

    const clearSearch = () => {
        setSearchTags([]);
    }

    const canAsk = isLoggedIn();

    return (
        <>
            <main className="w-screen overflow-x-hidden">
                <section className="w-screen px-6 lg:px-12 pt-8">
                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                            Hỏi – Đáp
                        </h1>
                        <div className="flex items-center gap-2">
                            <Link
                                to={canAsk ? "/forum/new" : "/login?redirect=/forum/new"}
                                className="rounded-full text-white px-4 py-2 text-sm font-semibold"
                                style={{ background: PRIMARY }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = PRIMARY_HOVER)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = PRIMARY)
                                }
                            >
                                + Đặt câu hỏi
                            </Link>
                            <Link
                                to="/forum/my"
                                className="text-[15px] text-blue-600 hover:underline"
                            >
                                Câu hỏi của tôi
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6">
                        <SearchBar onSubmit={onSearch} initialQuery={searchTags.join(' ')} />
                        {searchTags.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-slate-600">
                                    Đang lọc theo tags: {searchTags.map(tag => <code key={tag} className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-xs">{tag}</code>).reduce((prev, curr) => [prev, ' ', curr])}
                                </span>
                                <button onClick={clearSearch} className="text-xs text-blue-600 hover:underline">Xóa lọc</button>
                            </div>
                        )}
                    </div>
                </section>

                <section className="w-screen px-6 lg:px-12 py-8">
                    {err && (
                        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
                            Không thể tải: {err}
                        </div>
                    )}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border bg-white p-5 animate-pulse"
                                    style={{ borderColor: BORDER }}
                                >
                                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                    <div className="h-3 w-full bg-slate-100 rounded mt-3" />
                                    <div className="h-3 w-2/3 bg-slate-100 rounded mt-2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {items.map((q) => (
                                <QuestionCard key={q.id} q={q} />
                            ))}
                            {items.length === 0 && (
                                <div className="text-slate-600">Chưa có câu hỏi nào.</div>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage} />
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
