// src/pages/shared/Blog/components/SearchBar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BORDER } from "../utils/constants";
import { Section, Primary } from "./Common";

export default function SearchBar() {
    const [q, setQ] = useState("");
    const navigate = useNavigate();

    const submit = (e) => {
        e?.preventDefault?.();
        const key = q.trim();
        if (!key) return;
        navigate(`/blog/search?q=${encodeURIComponent(key)}`);
    };

    return (
        <Section
            id="search"
            title="Tìm kiếm bài viết"
            subtitle="Nhập từ khóa tiêu đề, tag hoặc tên tác giả"
        >
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="VD: react performance, UX, ielts speaking..."
                    className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2"
                    style={{ borderColor: BORDER }}
                />
                <Primary className="whitespace-nowrap" onClick={submit}>
                    Tìm kiếm
                </Primary>
            </form>
        </Section>
    );
}
