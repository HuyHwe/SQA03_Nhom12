// src/api/posts.api.js
import { authHeader } from "../utils/auth";

const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5102/api";

export async function fetchPosts() {
    const res = await fetch(`${API_BASE}/Posts`, {
        headers: { accept: "*/*" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json?.data || [] };
}

export async function fetchPostById(id) {
    const res = await fetch(`${API_BASE}/Posts/${id}`, {
        headers: { accept: "*/*" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

export async function fetchPostsByMember(memberId) {
    const res = await fetch(`${API_BASE}/Posts/member/${memberId}`, {
        headers: { accept: "*/*", ...authHeader() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json?.data || [] };
}

export async function searchPosts(tag) {
    const res = await fetch(`${API_BASE}/Posts/search?tag=${encodeURIComponent(tag)}`, {
        headers: { accept: "*/*" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json?.data || [] };
}

export async function createPost(data) {
    const res = await fetch(`${API_BASE}/Posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            ...authHeader(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || `HTTP ${res.status}`);
    }
    return await res.json();
}

export async function updatePost(id, data) {
    const res = await fetch(`${API_BASE}/Posts/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            ...authHeader(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || `HTTP ${res.status}`);
    }
    return await res.json();
}

export async function softDeletePost(id) {
    const res = await fetch(`${API_BASE}/Posts/deletesoft/${id}`, {
        method: "DELETE",
        headers: { accept: "*/*", ...authHeader() },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || `HTTP ${res.status}`);
    }
    return await res.json();
}

export async function hardDeletePost(id) {
    const res = await fetch(`${API_BASE}/Posts/deletehard/${id}`, {
        method: "DELETE",
        headers: { accept: "*/*", ...authHeader() },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || `HTTP ${res.status}`);
    }
    return await res.json();
}

export async function restorePost(id) {
    const res = await fetch(`${API_BASE}/Posts/restore/${id}`, {
        method: "PATCH",
        headers: { accept: "*/*", ...authHeader() },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.message || `HTTP ${res.status}`);
    }
    return await res.json();
}

export async function fetchDeletedPosts() {
    const res = await fetch(`${API_BASE}/Posts/PostIsdeletedSoft`, {
        headers: { accept: "*/*", ...authHeader() },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: Array.isArray(json) ? json : json?.data || [] };
}
