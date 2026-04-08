// src/pages/shared/Blog/components/Composer.jsx
import { useState } from "react";
import { http } from "../../../../utils/http";
import {
    API_BASE,
    BORDER,
    PRIMARY,
} from "../utils/constants";
import {
    isLoggedIn,
    authHeaders,
    normPost,
} from "../utils/helpers";
import { Section } from "./Common";

export default function Composer({ onCreated }) {
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState(null);
    const [okMsg, setOkMsg] = useState("");

    const canSubmit = title.trim().length >= 1;

    const submitPost = async () => {
        if (!isLoggedIn()) {
            setErr("Bạn cần đăng nhập để viết bài.");
            return;
        }
        if (!canSubmit || submitting) return;

        setOkMsg("");
        setErr(null);

        try {
            setSubmitting(true);

            const body = {
                title: title.trim(),
                thumbnailUrl: thumbnailUrl.trim() || null,
                tags: (tags || "").trim(),
                contentJson: JSON.stringify({ blocks: [{ text: content.trim() }] }),
                isPublished: !!isPublished,
            };

            const res = await http(`${API_BASE}/api/Posts`, {
                method: "POST",
                headers: authHeaders({
                    "Content-Type": "application/json",
                    accept: "*/*",
                }),
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const j = await res.json();
                    if (j?.message) msg = j.message;
                    else if (j?.error) msg = j.error;
                    else if (j?.title) msg = j.title;
                } catch { }
                throw new Error(msg);
            }

            const data = await res.json();
            const createdRaw = Array.isArray(data?.data)
                ? data.data[0]
                : data?.data || data;

            const created = normPost(createdRaw);

            setOkMsg("🎉 Đăng bài thành công!");
            onCreated?.(created);

            setTitle("");
            setTags("");
            setThumbnailUrl("");
            setContent("");
            setIsPublished(true);

            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            setErr(e?.message || "Không thể đăng bài.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLoggedIn()) return null;

    return (
        <Section
            id="compose"
            title="Viết bài mới"
            subtitle="Chia sẻ kiến thức/kinh nghiệm của bạn với cộng đồng"
        >
            <div
                className="bg-white border rounded-2xl p-5"
                style={{ borderColor: BORDER }}
            >
                {okMsg && (
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-4 py-3">
                        {okMsg}
                    </div>
                )}
                {err && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                        {err}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Tiêu đề</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                            style={{ borderColor: BORDER }}
                            placeholder="Ví dụ: Template Speaking Part 2…"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                            style={{ borderColor: BORDER }}
                            placeholder="react, ux, ielts"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Ảnh bìa (thumbnailUrl)</label>
                        <input
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                            style={{ borderColor: BORDER }}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Nội dung</label>
                        <textarea
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 w-full rounded-xl border px-4 py-2 outline-none focus:ring-2"
                            style={{ borderColor: BORDER }}
                            placeholder='Ví dụ: "SwiftUI rất hay..."'
                        />
                        <div className="mt-2 text-xs text-slate-500">
                            Ở backend, <code>contentJson</code> đang được gửi dạng JSON-string
                            giống phần Hỏi đáp.
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="accent-blue-600"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            Xuất bản ngay (isPublished)
                        </label>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button
                        type="button"
                        disabled={!canSubmit || submitting}
                        onClick={submitPost}
                        className={`rounded-full text-white px-5 py-3 transition ${submitting ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        style={{ backgroundColor: PRIMARY }}
                    >
                        {submitting ? "Đang đăng..." : "Đăng bài"}
                    </button>
                </div>
            </div>
        </Section>
    );
}
