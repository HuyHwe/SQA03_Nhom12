// src/pages/shared/Forum/components/SearchBar.jsx
import { useState } from "react";
import { BORDER, PRIMARY, PRIMARY_HOVER } from "../utils/constants";

export default function SearchBar({ onSubmit }) {
    const [q, setQ] = useState("");
    const submit = (e) => {
        e?.preventDefault?.();
        onSubmit?.(q.trim());
    };
    return (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm câu hỏi theo tag "
                className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2"
                style={{ borderColor: BORDER }}
            />
            <button
                type="submit"
                className="rounded-full text-white px-5 py-3"
                style={{ background: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PRIMARY_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.background = PRIMARY)}
            >
                Tìm kiếm
            </button>
        </form>
    );
}
