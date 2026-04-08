import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // <-- đọc từ ENV (5102)
  headers: {
    "Content-Type": "application/json",
    // backend đôi khi trả text/plain nên Accept thêm text/plain
    Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
  },
  withCredentials: false, // để true nếu BE dùng cookie
});

// Gắn token nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track if refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Chuẩn hoá response khi server trả text nhưng là JSON
api.interceptors.response.use(
  (res) => {
    if (typeof res.data === "string") {
      try { res.data = JSON.parse(res.data); } catch { }
    }
    return res;
  },
  async (err) => {
    const originalRequest = err.config;

    // If 401 error and not already retrying, try to refresh the token
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No refresh token available, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_state");
        window.location.href = "/login";
        return Promise.reject(err);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/Auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update auth_state if exists
        const authState = localStorage.getItem("auth_state");
        if (authState) {
          const parsed = JSON.parse(authState);
          parsed.token = newAccessToken;
          if (newRefreshToken) parsed.refreshToken = newRefreshToken;
          localStorage.setItem("auth_state", JSON.stringify(parsed));
        }

        // Update authorization header and retry original request
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_state");

        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Request error";
    return Promise.reject(new Error(msg));
  }
);
