// src/pages/shared/BecomInstructor/utils/helpers.js

export async function safeErr(res) {
    try {
        const t = await res.text();
        if (!t) return "";
        try {
            const j = JSON.parse(t);
            return j?.message || j?.error || t;
        } catch {
            return t;
        }
    } catch {
        return "";
    }
}
