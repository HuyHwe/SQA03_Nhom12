// src/pages/shared/Exam/hooks/useExams.js
import { useEffect, useState, useMemo } from "react";

export const useExams = (selectedTab, searchQuery) => {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [exams, setExams] = useState([]);

    const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:5102";
    const EXAMS_URL = `${API_BASE}/api/exams`;

    // Fetch exams
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const res = await fetch(EXAMS_URL, {
                    headers: { accept: "*/*" },
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setExams(Array.isArray(data) ? data : []);
            } catch (e) {
                if (e.name !== "AbortError") setErr(e.message || "Fetch error");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [EXAMS_URL]);

    // Filter + search
    const filtered = useMemo(() => {
        let list = exams;
        switch (selectedTab) {
            case "Bài học":
                list = list.filter((t) => t.lessonId);
                break;
            case "Nội dung khóa":
                list = list.filter((t) => t.courseContentId);
                break;
            case "Đang mở":
                list = list.filter((t) => t.isOpened === true);
                break;
            case "Đã khóa":
                list = list.filter((t) => t.isOpened === false);
                break;
        }
        const key = searchQuery.trim().toLowerCase();
        if (!key) return list;
        return list.filter(
            (t) =>
                (t.title || "").toLowerCase().includes(key) ||
                (t.description || "").toLowerCase().includes(key)
        );
    }, [exams, selectedTab, searchQuery]);

    return { loading, err, exams: filtered, totalExams: exams.length, EXAMS_URL };
};
