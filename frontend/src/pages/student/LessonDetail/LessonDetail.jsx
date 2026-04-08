// src/pages/LessonDetail.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";

import ErrorLoadingLesson from "./Component/ErrorLoadingLesson";
import Hero from "./Component/Hero";
import LessonBody from "./Component/LessonBody/LessonBody";
import { fetchLessonDetail, fetchListLessons } from "../../../api/lessons.api";
import { fetchExamsByLesson } from "../../../api/exams.api";
import { updateProgressEnrollment } from "../../../api/enrollments.api";

function LessonDetail() {
  const { lessonId, courseContentId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [exams, setExams] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update learning progress when opening a lesson
  useEffect(() => {
    let isMounted = true;

    async function markProgress() {
      if (!lessonId) return;
      try {
        // courseId is different from courseContentId, take it from lesson detail
        const courseId = lesson?.courseId;
        if (!courseId) return;
        await updateProgressEnrollment(courseId, lessonId);
      } catch (e) {
        if (!isMounted) return;
        console.error("Failed to update enrollment progress", e);
      }
    }

    markProgress();
    return () => {
      isMounted = false;
    };
  }, [lessonId, lesson]);

  // Fetch lesson detail
  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      try {
        const result = await fetchLessonDetail(lessonId, courseContentId);
        if (isMounted) setLesson(result.data);
      } catch (err) {
        if (!isMounted) return;

        if (err.message.includes("enrolled")) {
          setError("not-enrolled");
        } else {
          setError("unknown");
        }
      }
    };

    if (lessonId && courseContentId) loadLesson();

    return () => (isMounted = false);
  }, [lessonId, courseContentId]);

  // fetch list lessons
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // fetch list lessons
        const resSiblings = await fetchListLessons(courseContentId);
        const list = await resSiblings.data;
        const sorted = Array.isArray(list) ? list.sort((a, b) => a.order - b.order) : [];
        if (isMounted) setSiblings(sorted);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Lesson load error:", e);
          setError("Không tải được dữ liệu danh sách bài học. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (courseContentId) load();
    return () => { isMounted = false; };
  }, [courseContentId]);

  // fetch exams for this lesson
  useEffect(() => {
    let isMounted = true;

    async function loadExams() {
      try {
        setLoading(true);
        setError("");
        
        const resExams = await fetchExamsByLesson(lessonId);
        const list = await resExams.data;
        const sorted = Array.isArray(list) ? list.sort((a, b) => a.order - b.order) : [];
        if (isMounted) setExams(sorted);
      } catch (e) {
        if (!isMounted) return;

        if (e.message.includes("enrolled")) {
          setError("not-enrolled");
        } else {
          setError("unknown");
        }
      } finally {
        setLoading(false);
      }
    }

    if (lessonId) loadExams(lessonId);
    return () => (isMounted = false);
  }, [lessonId]);


  useEffect(() => window.scrollTo(0, 0), [lessonId]);

  /* =============== Derived data =============== */
  const idx = useMemo(
    () => (lesson ? siblings.findIndex(l => l.id === lesson.id) : -1),
    [lesson, siblings]
  );
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  /* =============== UI: loading / error =============== */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto p-10 grid gap-6">
            <div className="h-[240px] bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-5 bg-slate-100 w-2/3 rounded animate-pulse" />
            <div className="h-4 bg-slate-100 w-full rounded animate-pulse" />
          </div>
      </div>
    );
  }

  if (error || !lesson) return <ErrorLoadingLesson error={error} lessonId={lessonId} />;

  return (
    <div className="min-h-screen bg-white">
      <Hero lesson={lesson} />
      <LessonBody 
        courseContentId={courseContentId}
        lesson={lesson} 
        siblings={siblings} 
        exams={exams}
        idx={idx} 
        prev={prev} 
        next={next} 
        navigate={navigate} 
      />
    </div>
  );
}

export default LessonDetail;