// src/pages/shared/Forum/api.js
import { http } from "../utils/http";
import { API_BASE } from "../pages/shared/Forum/utils/constants";
import { authHeaders } from "../pages/shared/Forum/utils/helpers";

/**
 * Cập nhật một câu trả lời (discussion).
 * @param {string} discussionId ID của câu trả lời cần cập nhật.
 * @param {string} content Nội dung mới của câu trả lời.
 * @returns {Promise<Response>} The raw response from the fetch call.
 */
export const updateAnswerApi = (discussionId, content) => {
    return http(`${API_BASE}/api/Discussion/${discussionId}`, {
        method: 'PUT',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ content: content.trim() })
    });
};

/**
 * Xóa một câu trả lời (discussion).
 * @param {string} discussionId ID của câu trả lời cần xóa.
 * @returns {Promise<Response>} The raw response from the fetch call.
 */
export const deleteAnswerApi = (discussionId) => {
    return http(`${API_BASE}/api/Discussion/${discussionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
};