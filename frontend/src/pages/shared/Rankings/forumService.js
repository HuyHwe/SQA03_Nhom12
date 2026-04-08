import axios from 'axios';
import { authHeader } from '../../../utils/auth';

// Cấu hình base URL cho API của bạn.
// Bạn nên đặt nó trong biến môi trường (ví dụ: .env) để dễ quản lý.
// Ví dụ: VITE_API_BASE_URL=http://localhost:5000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5102';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàm để lấy dữ liệu bảng xếp hạng (rankings)
// Đây là một hàm giả định, bạn cần thay đổi endpoint và cấu trúc dữ liệu trả về cho phù hợp với API thực tế của bạn.
export const getRankings = async ({ page = 1, pageSize = 10 }) => {
    try {
        const response = await api.get(`/api/StudentStats`, { // Thay thế '/api/rankings' bằng endpoint thực tế của bạn
            params: { page, pageSize }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching rankings:", error);
        throw error;
    }
};

// Hàm để kiểm tra điều kiện làm giảng viên
export const checkTeacherEligibility = async () => {
    try {
        // Sử dụng instance `api` đã có baseURL và thêm header xác thực
        const response = await api.get(`/api/StudentStats/ifTeacher`, {
            headers: authHeader()
        });
        return response.data;
    } catch (error) {
        console.error("Error checking teacher eligibility:", error);
        // Trả về false nếu có lỗi (ví dụ: 401 Unauthorized, 404 Not Found, ...)
        return false;
    }
};

// Hàm để lấy dữ liệu thống kê từ StudentStatsController
export const getStats = async (month) => {
    // Endpoint tương ứng với StudentStatsController của bạn là /api/StudentStats
    try {
        const response = await api.get(`/api/StudentStats`, { params: { month } });
        return response.data;
    } catch (error) {
        // Ghi log lỗi ra console và ném lỗi để react-query có thể bắt được
        console.error("Error fetching student stats:", error);
        throw error;
    }
};