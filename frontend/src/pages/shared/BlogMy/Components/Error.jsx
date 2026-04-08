// src/pages/shared/BlogMy/Components/Error.jsx
export default function Error({ error, onRetry }) {
    if (!error) return null;

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            Không thể tải dữ liệu (chi tiết: {error})
            <div className="mt-3">
                <button
                    onClick={onRetry}
                    className="rounded-full border px-4 py-2 text-sm hover:bg-white"
                >
                    Thử lại
                </button>
            </div>
        </div>
    );
}
