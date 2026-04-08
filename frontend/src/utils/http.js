// src/utils/http.js
import { authHeader, clearToken, getRefreshToken, setTokens, clearAllAuth } from "../utils/auth";

const API_BASE = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE || "http://localhost:5102";

// Helper: gọi fetch
async function rawFetch(url, opts = {}) {
  // Nếu url không bắt đầu bằng http, thêm API_BASE
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, opts);
  return res;
}

// Thử refresh token
async function tryRefreshToken() {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const res = await rawFetch(`${API_BASE}/api/Auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "*/*" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Chuẩn hóa key phổ biến: accessToken/refreshToken
    const at = data?.accessToken || data?.token || data?.access_token;
    const newRt = data?.refreshToken || data?.refresh_token || rt;
    if (!at) return null;
    setTokens({ accessToken: at, refreshToken: newRt });
    return at;
  } catch {
    return null;
  }
}

/**
 * http(url, opts)
 * - Tự thêm Authorization (nếu có token)
 * - Nếu 401 → refresh token → retry 1 lần
 */
export async function http(url, opts = {}) {
  const headers = {
    accept: "*/*",
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...authHeader(),
  };

  const first = await rawFetch(url, { ...opts, headers });

  if (first.status !== 401) return first;

  // 401: thử refresh
  const newAT = await tryRefreshToken();
  if (!newAT) {
    clearToken();
    // Có thể clearAllAuth() nếu muốn ép logout
    return first; // trả về 401 cho caller tự xử lý
  }

  // retry 1 lần với token mới
  const retryHeaders = {
    ...headers,
    Authorization: `Bearer ${newAT}`,
  };
  const second = await rawFetch(url, { ...opts, headers: retryHeaders });
  return second;
}
