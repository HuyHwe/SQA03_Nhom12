// src/pages/shared/BlogMy/Components/EmptyState.jsx
const BORDER = "#e5e7eb";

export default function EmptyState() {
    return (
        <div className="rounded-xl border bg-white p-6 text-slate-600" style={{ borderColor: BORDER }}>
            Chưa có bài viết nào.
        </div>
    );
}
