// src/pages/shared/Forum/utils/helpers.js
import { isLoggedIn, authHeader, requireAuth } from "../../../../utils/auth";

export { isLoggedIn, authHeader, requireAuth };

export const getToken = () => {
    try {
        return localStorage.getItem("app_access_token") || null;
    } catch {
        return null;
    }
};

export const authHeaders = (extra = {}) => {
    const t = getToken();
    return t ? { ...extra, Authorization: `Bearer ${t}` } : { ...extra };
};
