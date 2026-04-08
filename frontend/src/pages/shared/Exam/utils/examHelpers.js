// src/pages/shared/Exam/utils/examHelpers.js

export const formatDuration = (minutes) => {
    if (typeof minutes !== "number" || isNaN(minutes)) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
    if (h > 0) return `${h} giờ`;
    return `${m} phút`;
};

export const sourceLabel = (exam) => {
    if (exam.lessonId) return "Bài học";
    if (exam.courseContentId) return "Nội dung khóa";
    return "Khác";
};

export const EXAM_FILTERS = ["Tất cả", "Bài học", "Nội dung khóa", "Đang mở", "Đã khóa"];

export const PRIMARY = "#2c65e6";
export const PRIMARY_HOVER = "#2153c3";
