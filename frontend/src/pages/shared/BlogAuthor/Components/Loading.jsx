// src/pages/shared/BlogAuthor/Components/Loading.jsx
const BORDER = "#e5e7eb";

export default function Loading() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border bg-white overflow-hidden animate-pulse"
                    style={{ borderColor: BORDER }}
                >
                    <div className="aspect-[16/9] bg-slate-100" />
                    <div className="p-5 space-y-3">
                        <div className="h-4 w-3/4 bg-slate-100 rounded" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
