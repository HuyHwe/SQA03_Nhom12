// src/pages/shared/BlogDetail/utils/helpers.js

/** LocalStorage helper */
export const ls = {
    get: (k, fallback) => {
        try {
            const v = localStorage.getItem(k);
            return v ? JSON.parse(v) : fallback;
        } catch {
            return fallback;
        }
    },
    set: (k, v) => {
        try {
            localStorage.setItem(k, JSON.stringify(v));
        } catch { }
    },
};

/** Format timestamp */
export const fmtTime = (d) =>
    d ? new Date(d).toLocaleString("vi-VN", { hour12: false }) : "—";

/** Normalize post detail from API */
export const normDetail = (p) => {
    const tags = (p?.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    return {
        id: p?.id,
        title: p?.title || "Bài viết",
        cover: p?.thumbnailUrl || "/images/blog-placeholder.jpg",
        tags,
        tagDisplay: tags[0] || "Blog",
        views: p?.viewCount ?? 0,
        likes: p?.likeCount ?? 0,
        comments: p?.discussionCount ?? 0,
        isPublished: !!p?.isPublished,
        createdAt: p?.createdAt || null,
        updatedAt: p?.updatedAt || null,
        authorId: p?.authorId || null,
        authorName: p?.authorName || "Tác giả",
        contentJson: p?.contentJson || null,
    };
};

/** Normalize list item from API */
export const normListItem = (p) => ({
    id: p?.id,
    title: p?.title || "Bài viết",
    cover: p?.thumbnailUrl || "/images/blog-placeholder.jpg",
    tags: (p?.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    tagDisplay:
        (p?.tags || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)[0] || "Blog",
    authorName: p?.authorName || "Tác giả",
    views: p?.viewCount ?? 0,
});
