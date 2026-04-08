const BASE_URL = "http://localhost:5102";

export async function baseFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw body?.message || `Request failed: ${res.status}`;
  }
  return res.json();
}
