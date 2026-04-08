// src/pages/shared/BlogAuthor/Components/Error.jsx
export default function Error({ error }) {
    if (!error) return null;

    return (
        <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
            Không thể tải bài viết của tác giả (chi tiết: {error})
        </div>
    );
}
