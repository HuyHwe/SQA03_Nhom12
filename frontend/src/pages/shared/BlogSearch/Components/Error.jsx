// src/pages/shared/BlogSearch/Components/Error.jsx
export default function Error({ error }) {
    if (!error) return null;

    return (
        <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-600 mb-4">
            Không thể tải kết quả (chi tiết: {error})
        </div>
    );
}
