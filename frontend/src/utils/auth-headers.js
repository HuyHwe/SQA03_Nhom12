export function getToken() {
try {
const t = JSON.parse(localStorage.getItem("auth_token") || "null");
if (t?.accessToken) return t.accessToken;
} catch {}
try {
const t = localStorage.getItem("access_token");
if (t) return t;
} catch {}
return null;
}


export function authHeaders(extra = {}) {
const tk = getToken();
return tk ? { ...extra, Authorization: `Bearer ${tk}` } : { ...extra };
}