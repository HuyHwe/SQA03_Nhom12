// src/pages/shared/Home/utils/constants.js

// Colors
export const PRIMARY = "#2c65e6";
export const PRIMARY_HOVER = "#2153c3";
export const BORDER = "#e0e0e0";

// API
export const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5102";

// FAQ default data
export const faqsDefault = [
    {
        q: "Học trên nền tảng này cần chuẩn bị gì?",
        a: "Chỉ cần máy tính/điện thoại có internet. Bạn có thể học mọi lúc – mọi nơi, nền tảng hỗ trợ đồng bộ tiến độ."
    },
    {
        q: "Khoá học có thời hạn không?",
        a: "Tuỳ gói thành viên và khoá học. Với gói thành viên, bạn có thể truy cập toàn bộ thư viện trong thời hạn gói."
    },
    {
        q: "Đề thi có đáp án & giải chi tiết?",
        a: "Có. Sau khi nộp bài, bạn xem lại đáp án đúng/sai, giải thích và thống kê để ôn lại."
    },
    {
        q: "Tôi có thể học theo lộ trình gợi ý?",
        a: "Có. Mỗi mục tiêu có lộ trình gồm bài học + luyện tập + đề mô phỏng. Bạn theo dõi tiến độ ở Dashboard."
    },
];
