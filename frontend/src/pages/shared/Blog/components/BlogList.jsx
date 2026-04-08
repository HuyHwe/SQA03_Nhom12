// src/pages/shared/Blog/components/BlogList.jsx
import { useRef } from "react";
import { BORDER } from "../utils/constants";
import Pagination from "../../Exam/Components/Pagination";
import { Section, Tag } from "./Common";
import PostCard from "./PostCard";

export default function BlogList({
    posts,
    loading,
    error,
    onSelectTag,
    selectedTag,
    allTags,
    page,
    totalPages,
    onPageChange,
}) {
    const scrollRef = useRef(null);
    const scroll = (dir) =>
        scrollRef.current?.scrollBy({
            left: dir === "left" ? -360 : 360,
            behavior: "smooth",
        });

    return (
        <Section
            id="list"
            title="Bài viết mới"
            subtitle="Chọn chủ đề bạn quan tâm để lọc nội dung"
            action={<TagFilter allTags={allTags} selectedTag={selectedTag} onSelectTag={onSelectTag} />}
        >
            {/* Scroll buttons */}
            <div className="flex items-center justify-end gap-2 mb-4">
                <button
                    onClick={() => scroll("left")}
                    className="rounded-full border w-9 h-9 flex items-center justify-center hover:bg-slate-50"
                    aria-label="Trượt trái"
                >
                    ‹
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="rounded-full border w-9 h-9 flex items-center justify-center hover:bg-slate-50"
                    aria-label="Trượt phải"
                >
                    ›
                </button>
            </div>

            {error && (
                <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
                    Không thể tải bài viết (chi tiết: {error})
                </div>
            )}

            {loading && posts.length === 0 ? (
                <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pr-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border bg-white overflow-hidden animate-pulse"
                            style={{ borderColor: BORDER }}
                        >
                            <div className="aspect-[16/9] bg-slate-100" />
                            <div className="p-5">
                                <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
                                <div className="h-4 w-3/4 bg-slate-100 rounded mb-1" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pr-6 min-h-[320px]">
                    {posts.map((p) => (
                        <div key={p.id} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px]">
                            <PostCard post={p} />
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="w-full flex items-center justify-center text-center text-slate-600 border border-dashed rounded-2xl" style={{ borderColor: BORDER }}>
                            Không có bài viết cho bộ lọc hiện tại.
                        </div>
                    )}
                </div>
            )}

            {/* Thêm div bọc ngoài và class mt-8 để giữ khoảng cách */}
            <div className="mt-8">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </Section>
    );
}

function TagFilter({ allTags, selectedTag, onSelectTag }) {
    return (
        <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
                <Tag
                    key={t}
                    active={t === selectedTag}
                    onClick={() => onSelectTag(t)}
                >
                    {t}
                </Tag>
            ))}
        </div>
    )
}
