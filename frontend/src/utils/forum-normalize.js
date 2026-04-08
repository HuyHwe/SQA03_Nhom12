// Normalize ForumQuestion objects from the API into a UI-friendly shape
export function normalizeQuestion(q) {
if (!q) return null;
const tagsArr = Array.isArray(q.tags)
? q.tags
: typeof q.tags === "string"
? q.tags.split(",").map(s => s.trim()).filter(Boolean)
: [];


return {
id: q.id,
title: q.title ?? "—",
// API fields
authorName: q.studentName ?? q.authorName ?? "—",
authorId: q.studentId ?? q.authorId ?? null,
tags: tagsArr,
viewCount: q.viewCount ?? 0,
discussionCount: q.discussionCount ?? q.answers ?? 0,
likeCount: q.likeCount ?? 0,
createdAt: q.createdAt ?? q.updatedAt ?? null,
updatedAt: q.updatedAt ?? null,
isDeleted: q.isDeleted === true,
deletedAt: q.deletedAt ?? null,


// content
contentJson: q.contentJson ?? null, // string JSON from API
content: q.content ?? null,
};
}


export function parseContentText(contentJson, fallback = "") {
try {
const j = typeof contentJson === "string" ? JSON.parse(contentJson) : contentJson;
const blocks = Array.isArray(j?.blocks) ? j.blocks : [];
return blocks.map(b => b.text || "").join("\n\n").trim() || fallback || "";
} catch {
return fallback || "";
}
}