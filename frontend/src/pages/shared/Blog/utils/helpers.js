// src/pages/shared/Blog/utils/helpers.js
import { isLoggedIn } from "../../../../utils/auth";

export { isLoggedIn };

// ===== Local Helpers from Blog.OLD.jsx =====

function readLocal(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
        return null;
    }
}

function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1] || ""));
    } catch {
        return null;
    }
}

/** Lấy token + memberId (studentId || teacherId) chắc chắn */
export function getAuthInfoStrict() {
    // cố gắng lấy token từ nhiều nơi
    let token = null;
    const tObj = readLocal("auth_token"); // { accessToken, refreshToken } ?
    if (tObj?.accessToken) token = tObj.accessToken;

    if (!token) {
        const tStr = localStorage.getItem("access_token"); // chuỗi thuần?
        if (tStr) token = tStr;
    }
    if (!token) {
        const authUser = readLocal("auth_user"); // có thể { token, studentId, teacherId, userId, ... }
        if (authUser?.token) token = authUser.token;
        if (!token && authUser?.accessToken) token = authUser.accessToken;
    }
    if (!token) {
        const raw = localStorage.getItem("token"); // đôi khi bạn lưu thế này
        if (raw) token = raw.replace(/^"|"$/g, ""); // bỏ quote nếu là JSON string
    }

    // DEBUG: Kiểm tra token có được tìm thấy không
    console.log("[helpers.js] getAuthInfoStrict - Found token:", token);

    // Nếu có token, giải mã nó để lấy thông tin người dùng
    let memberId = null;
    if (token) {
        const claims = decodeJwt(token) || {};

        // DEBUG: Log the entire claims object and specific studentId claims
        console.log("[helpers.js] Decoded claims object:", claims);
        console.log("[helpers.js] Value of claims.StudentId (uppercase S):", claims.StudentId);
        console.log("[helpers.js] Value of claims.studentId (lowercase s):", claims.studentId);

        // Ưu tiên lấy studentId từ claims của token
        memberId =
            claims.StudentId ||
            claims.studentId ||
            claims.TeacherId ||
            claims.teacherId ||
            null;
    } else {
        // Phương án dự phòng: nếu không có token, thử tìm trong localStorage
        const authUser = readLocal("auth_user");
        if (authUser?.studentId) memberId = authUser.studentId;
        else if (authUser?.teacherId) memberId = authUser.teacherId;
    }

    return { token, memberId };
}

/** Tạo headers có Authorization nếu có token */
function getAuthUser() {
    try {
        return JSON.parse(localStorage.getItem("auth_user") || "null") || null;
    } catch {
        return null;
    }
}

function getAccessToken() {
    const u = getAuthUser();
    return u?.token || null;
}

/**
 * Tạo headers có Authorization nếu có token.
 * @param {boolean} includeContentType - Mặc định là true, có thêm 'Content-Type': 'application/json'.
 * @returns {object} - Headers object.
 */
export function authHeaders(includeContentType = true) {
    const { token } = getAuthInfoStrict(); // Sử dụng hàm lấy token đáng tin cậy hơn
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }

    // DEBUG: Kiểm tra header được tạo ra
    console.log("[helpers.js] authHeaders - Generated headers:", headers);
    return headers;
}

// ===== Normalizer =====

export const normPost = (p) => {
    return {
        id: p?.id,
        title: p?.title || "Bài viết",
        cover: p?.thumbnailUrl || "/images/blog-placeholder.jpg",
        tags: (p?.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
        tagDisplay:
            (p?.tags || "").split(",").map((s) => s.trim()).filter(Boolean)[0] ||
            "Blog",
        views: p?.viewCount ?? 0,
        likes: p?.likeCount ?? 0,
        comments: p?.discussionCount ?? 0,
        isPublished: !!p?.isPublished,
        createdAt: p?.createdAt || null,
        authorId: p?.authorId || null,
        authorName: p?.authorName || "Tác giả",
    };
};
