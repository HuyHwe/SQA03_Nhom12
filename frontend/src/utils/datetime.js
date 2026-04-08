export function formatVi(ts) {
try {
return new Date(ts || Date.now()).toLocaleString("vi-VN", { hour12: false });
} catch {
return "";
}
}