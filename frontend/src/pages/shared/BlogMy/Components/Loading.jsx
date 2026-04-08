// src/pages/shared/BlogMy/Components/Loading.jsx
const BORDER = "#e5e7eb";

export default function Loading() {
    return (
        <div className="rounded-xl border bg-white p-6 text-slate-600" style={{ borderColor: BORDER }}>
            Đang tải…
        </div>
    );
}
