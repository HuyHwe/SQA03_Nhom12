// src/pages/shared/BlogEditor/Components/EditorForm.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";

const BORDER = "#e5e7eb";
const BRAND = { primary: "#2563eb" };

const DEFAULT_THUMBNAILS = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIbCEXFd9VvAXuTZRJMgGwaz9xOosWHkHJDA&s",
    "https://t3.ftcdn.net/jpg/03/48/39/74/360_F_348397404_wXuf22GUPNAh67htBZZnaDSx3Bj92yep.jpg",
    "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg?semt=ais_hybrid&w=740&q=80",
    "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?cs=srgb&dl=pexels-goumbik-574071.jpg&fm=jpg",
    "https://static.vecteezy.com/system/resources/thumbnails/027/516/603/small/concept-of-web-design-and-mobile-app-programmer-working-and-coding-for-remote-work-development-and-technology-for-online-education-and-learning-concept-flat-illustration-on-a-white-background-vector.jpg"
];

export default function EditorForm({
    mode,
    postId,
    title,
    setTitle,
    tags,
    setTags,
    thumbnailUrl,
    setThumbnailUrl,
    content,
    setContent,
    isPublished,
    setIsPublished,
    canSubmit,
    saving,
    onSave,
    loading,
    error
}) {
    // Tự động chọn ảnh bìa ngẫu nhiên nếu chưa có
    useEffect(() => {
        if (!thumbnailUrl) {
            const randomThumb = DEFAULT_THUMBNAILS[Math.floor(Math.random() * DEFAULT_THUMBNAILS.length)];
            setThumbnailUrl(randomThumb);
        }
    }, []);

    if (loading) {
        return (
            <div className="bg-white border rounded-2xl p-5" style={{ borderColor: BORDER }}>
                <div className="text-slate-600">Đang tải dữ liệu…</div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-2xl p-5" style={{ borderColor: BORDER }}>
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {mode === "edit" && (
                    <div className="text-xs text-slate-500">
                        ID: <span className="font-mono">{postId}</span>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium">Tiêu đề</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                        style={{ borderColor: BORDER }}
                        placeholder="Tiêu đề bài viết…"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Tags (phân cách bằng dấu phẩy)</label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                            style={{ borderColor: BORDER }}
                            placeholder="react, performance, ux…"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Nội dung</label>
                    <textarea
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
                        style={{ borderColor: BORDER }}
                        placeholder="Nội dung (sẽ lưu vào contentJson.blocks[0].text)…"
                    />
                    
                </div>

                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="accent-blue-600"
                    />
                    Xuất bản ngay (isPublished)
                </label>

                <div className="flex items-center justify-end gap-2">
                    <Link to="/blog/my" className="rounded-full border px-4 py-2 hover:bg-slate-50">
                        Hủy
                    </Link>
                    <button
                        onClick={onSave}
                        disabled={!canSubmit || saving}
                        className="rounded-full text-white px-4 py-2 font-semibold transition disabled:opacity-60"
                        style={{ backgroundColor: BRAND.primary }}
                    >
                        {saving ? "Đang lưu…" : mode === "create" ? "Xuất bản" : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}
