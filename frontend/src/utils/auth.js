import { jwtDecode } from "jwt-decode";
/*** ===== Keys trong localStorage ===== ***/
export const AUTH_KEY = "app_auth_status"; // "1" = đã đăng nhập
export const AT_KEY = "app_access_token"; // access token (JWT)
export const RT_KEY = "app_refresh_token"; // refresh token
export const USER_KEY = "app_user"; // thông tin hiển thị (name/email/avatar)
export const REDIRECT_KEY = "post_login_redirect";

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      teacherId: decoded["TeacherId"] || null,
      studentId: decoded["StudentId"] || null,
      adminId: decoded["AdminId"] || null,
      fullName:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      raw: decoded,
    };
  } catch {
    return null;
  }
}

/* Trạng thái đăng nhập */
export function isLoggedIn() {
  try {
    return (
      localStorage.getItem(AUTH_KEY) === "1" && !!localStorage.getItem(AT_KEY)
    );
  } catch {
    return false;
  }
}

/* Lấy/Ghi token */
export function getToken() {
  try {
    return localStorage.getItem(AT_KEY) || null;
  } catch {
    return null;
  }
}
export function getRefreshToken() {
  try {
    return localStorage.getItem(RT_KEY) || null;
  } catch {
    return null;
  }
}

// Get Role user
export function getRole() {
  const token = localStorage.getItem(AT_KEY);
  if (!token) return "guest";

  try {
    const decoded = jwtDecode(token); // decode JWT
    let roles = decoded.role || decoded.roles || [];
    if (!Array.isArray(roles)) roles = [roles];
    return roles || "guest";
  } catch (err) {
    console.error(err);
    return "guest";
  }
}

export function setTokens({ accessToken, refreshToken }) {
  try {
    if (accessToken) localStorage.setItem(AT_KEY, accessToken);
    if (refreshToken) localStorage.setItem(RT_KEY, refreshToken);
    localStorage.setItem(AUTH_KEY, "1");
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(AT_KEY);
  } catch {}
}

/* Đăng xuất */
export function clearAllAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AT_KEY);
    localStorage.removeItem(RT_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("app_header_mode");
  } catch {}
}

/*** ===== Thông tin người dùng để hiển thị header ===== ***/
export function setUserDisplay(userLike) {
  try {
    const u = {
      name: userLike?.name || userLike?.fullName || userLike?.username || "",
      email: userLike?.email || "",
      avatar: userLike?.avatarUrl || userLike?.avatar || null,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  } catch {}
}
export function getUserDisplay() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

/*Header Authorization*/
export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function requireAuth(navigate, redirectTo) {
  if (isLoggedIn()) return true;
  const target =
    redirectTo ||
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/");
  try {
    localStorage.setItem(REDIRECT_KEY, target);
  } catch {}
  const qs = `redirect=${encodeURIComponent(
    target
  )}&returnTo=${encodeURIComponent(target)}`;
  navigate(`/login?${qs}`, { replace: true });
  return false;
}
export function consumePendingNext() {
  try {
    const v = localStorage.getItem(REDIRECT_KEY);
    if (v) {
      localStorage.removeItem(REDIRECT_KEY);
      return v;
    }
  } catch {}
  return null;
}
export function redirectBackAfterLogin(navigate, fallback = "/") {
  const saved = consumePendingNext();
  navigate(saved || fallback, { replace: true });
}

export function setLoginPayload(loginJson) {
  if (!loginJson) return;
  setTokens({
    accessToken: loginJson.token,
    refreshToken: loginJson.refreshToken,
  });
  setUserDisplay({
    name: loginJson.fullName,
    email: loginJson.email, // nếu backend có
    avatarUrl: loginJson.avatar, // nếu backend có
  });
}

export function setRefreshPayload(refreshJson) {
  if (!refreshJson) return;
  setTokens({
    accessToken: refreshJson.token,
    refreshToken: refreshJson.refreshToken,
  });
  if (refreshJson.fullName || refreshJson.email || refreshJson.avatar) {
    setUserDisplay({
      name: refreshJson.fullName,
      email: refreshJson.email,
      avatarUrl: refreshJson.avatar,
    });
  }
}

export async function authFetch(input, init = {}) {
  const headers = { ...(init.headers || {}), ...authHeader() };
  return fetch(input, { ...init, headers });
}

// Header mode (student / teacher / admin)
const HEADER_MODE_KEY = "app_header_mode";

export function getHeaderMode() {
  try {
    const v = localStorage.getItem(HEADER_MODE_KEY);
    return v || "student";
  } catch {
    return "student";
  }
}

export function setHeaderMode(mode) {
  try {
    if (!mode) mode = "student";
    localStorage.setItem(HEADER_MODE_KEY, mode);
    try {
      window.dispatchEvent(
        new CustomEvent("headerModeChanged", { detail: { mode } })
      );
    } catch {
      // Ignore
    }
  } catch {
    // Ignore
  }
}

export function clearHeaderMode() {
  try {
    localStorage.removeItem(HEADER_MODE_KEY);
    try {
      window.dispatchEvent(
        new CustomEvent("headerModeChanged", { detail: { mode: "student" } })
      );
    } catch {
      // Ignore
    }
  } catch {
    // Ignore
  }
}
