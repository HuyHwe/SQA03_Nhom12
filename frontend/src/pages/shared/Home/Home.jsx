// src/pages/shared/Home/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { http } from "../../../utils/http";
import { API_BASE } from "./utils/constants";
import { normCourse, normExam, normPost } from "./utils/normalizers";
import {
    HeroSection,
    QuickNav,
    FeaturedCourses,
    FeaturesSection,
    ExamShowcase,
    MetricsSection,
    TestimonialSection,
    BlogPreview,
    NewsletterSection,
    FAQSection,
    CTASection,
} from "./components";

export default function Homepage() {
    const navigate = useNavigate();

    // State
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({ courses: null, exams: null, posts: null });

    const [courses, setCourses] = useState([]);
    // const [exams, setExams] = useState([]);
    const [posts, setPosts] = useState([]);

    // Fetch initial data
    useEffect(() => {
        let ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErrors({ courses: null, exams: null, posts: null });

                // Courses
                const cRes = await http(`${API_BASE}/api/courses`, { signal: ac.signal, headers: { accept: "*/*" } });
                const cJson = cRes.ok ? await cRes.json() : [];
                const cArr = Array.isArray(cJson?.data ?? cJson) ? (cJson.data ?? cJson) : [];
                setCourses(cArr.map(normCourse));

                // Exams
                const eRes = await http(`${API_BASE}/api/exam`, { signal: ac.signal, headers: { accept: "*/*" } });
                const eJson = eRes.ok ? await eRes.json() : [];
                const eArr = Array.isArray(eJson?.data ?? eJson) ? (eJson.data ?? eJson) : [];
                // setExams(eArr.map(normExam));

                // Posts
                const pRes = await http(`${API_BASE}/api/Posts`, { signal: ac.signal, headers: { accept: "*/*" } });
                const pJson = pRes.ok ? await pRes.json() : [];
                const pArr = Array.isArray(pJson?.data ?? pJson) ? (pJson.data ?? pJson) : [];
                setPosts(pArr.map(normPost));
            } catch (e) {
                setErrors((prev) => ({ ...prev, general: e?.message || "Fetch error" }));
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, []);

    // Search courses
    const doSearch = async () => {
        if (!q.trim()) return navigate(`/courses`);
        try {
            setLoading(true);
            setErrors((prev) => ({ ...prev, courses: null }));
            const res = await http(`${API_BASE}/api/courses/search?q=${encodeURIComponent(q.trim())}`, {
                headers: { accept: "*/*" },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const arr = Array.isArray(data?.data ?? data) ? (data.data ?? data) : [];
            setCourses(arr.map(normCourse));
        } catch (e) {
            setErrors((prev) => ({ ...prev, courses: e?.message || "Search error" }));
        } finally {
            setLoading(false);
        }
    };

    // Derived data for display
    const featuredCourses = useMemo(() => courses.slice(0, 8), [courses]);
    // const examsShowcase = useMemo(() => exams.slice(0, 3), [exams]);
    const blogPosts = useMemo(() => posts.slice(0, 3), [posts]);

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <HeroSection query={q} setQuery={setQ} onSearch={doSearch} />
            <QuickNav />
            <FeaturedCourses courses={featuredCourses} loading={loading} error={errors.courses} onNavigate={navigate} />
            {/* <FeaturesSection /> */}
            {/* <ExamShowcase exams={examsShowcase} loading={loading} error={errors.exams} onNavigate={navigate} /> */}
            {/* <MetricsSection /> */}
            {/* <TestimonialSection /> */}
            <BlogPreview posts={blogPosts} loading={loading} error={errors.posts} />
            {/* <NewsletterSection /> */}
            <FAQSection />
            <CTASection />
        </div>
    );
}
