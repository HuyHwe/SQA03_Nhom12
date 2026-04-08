// src/pages/shared/CourseSearch/CourseSearch.jsx
// Simplified version pointing to Courses component
// This page is essentially a search-focused version of Courses
// Since Courses already has full search/filter functionality,
// we'll create a lightweight wrapper that redirects or reuses Courses logic

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function CourseSearch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Redirect to main Courses page with search params
    useEffect(() => {
        const query = searchParams.get("q") || "";
        navigate(`/courses?search=${encodeURIComponent(query)}`, { replace: true });
    }, [navigate, searchParams]);

    return null; // Will redirect immediately
}

export default CourseSearch;
