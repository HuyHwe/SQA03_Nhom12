// src/pages/shared/Home/utils/normalizers.js

/** Helper: pick specific keys from object */
export const pick = (obj, keys) => keys.reduce((o, k) => (o[k] = obj?.[k], o), {});

/** Normalize course data from API */
export const normCourse = (c) => ({
    id: c?.id ?? c?.courseId ?? String(Math.random()),
    title: c?.title ?? c?.name ?? "Khóa học",
    desc: c?.description ?? c?.shortDescription ?? "",
    lessons: c?.lessonsCount ?? c?.totalLessons ?? c?.lessons?.length ?? "—",
    level: c?.level ?? c?.difficulty ?? "All levels",
    thumb: c?.thumbnailUrl ?? c?.imageUrl ?? "/images/course-placeholder.jpg",
});

/** Normalize exam data from API */
export const normExam = (e) => ({
    id: e?.id ?? e?.examId ?? String(Math.random()),
    title: e?.title ?? "Đề thi",
    duration: e?.durationMinutes ?? e?.timeLimit ?? 0,
    opened: e?.isOpened ?? e?.isOpen ?? true,
});

/** Normalize post data from API */
export const normPost = (p) => ({
    id: p?.id ?? p?.postId ?? String(Math.random()),
    title: p?.title ?? "Bài viết",
    tag: p?.tag ?? p?.category ?? "Blog",
    cover: p?.coverImage ?? p?.thumbnail ?? "/images/blog-placeholder.jpg",
});
