// src/pages/shared/BecomInstructor/components/Common.jsx
import React from "react";

export function InfoRow({ label, value, highlight = false }) {
    return (
        <div
            className={`rounded-xl border p-3 ${highlight ? "border-emerald-200 bg-emerald-50" : ""
                }`}
        >
            <div className="text-[11px] text-gray-500">{label}</div>
            <div className="font-semibold text-gray-900 break-all">
                {String(value)}
            </div>
        </div>
    );
}

export function TokenRow({ label, value }) {
    if (!value) return null;
    // để hiển thị gọn: 8 ký tự đầu + … + 6 ký tự cuối
    const short =
        value.length > 20 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            alert("Đã copy token vào clipboard.");
        } catch {
            alert("Không thể copy token.");
        }
    };
    return (
        <div className="rounded-xl border p-3 text-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="text-[11px] text-gray-500">{label}</div>
                <div className="font-mono text-gray-900 break-all">{short}</div>
            </div>
            <button
                onClick={onCopy}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
            >
                Copy
            </button>
        </div>
    );
}
