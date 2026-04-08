
// src/pages/shared/CourseDetail.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Section from "../../../components/Section";
import Hero from "./Component/Hero";
import ListLesson from "./Component/ListLesson";
import ListReview from "./Component/ListReview";

import { fetchCourseDetail } from "../../../api/courses.api";
import { fetchCourseContent } from "../../../api/courseContent.api";
import { fetchListLessons } from "../../../api/lessons.api";
import { fetchCourseReviews, hasReviewedCourse } from "../../../api/courseReview.api";
import { isEnrolled } from "../../../api/enrollments.api";

function CourseDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [intro, setIntro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseContentId, setCourseContentId] = useState(null);

  const [listLesson, setListLesson] = useState([]);
  const [listReview, setListReview] = useState([]);

  const [isEnrolledState, setIsEnrolledState] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  // check enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const result = await isEnrolled(id);
        setIsEnrolledState(result.data.isEnrolled);
      } catch (err) {
        console.error(err);
        setIsEnrolledState(false);
      }
    };

    checkEnrollment();
  }, [id]);

  // check reviewed
  useEffect(() => {
    const checkReviewed = async () => {
      try{
        const result = await hasReviewedCourse(id);
        setHasReviewed(result.data.hasReviewed);
      } catch (err){
        console.error(err);
        setHasReviewed(false);
      }
    };

    checkReviewed();
  }, [id]);

  // fetch detail
  useEffect(() => {
    const ac = new AbortController();

    async function loadCourseDetail() {
      try {
        setLoading(true);
        setError("");

        // Course detail
        const resultFetchCourse = await fetchCourseDetail(id, { signal: ac.signal });
        setCourse(resultFetchCourse.data);
        
        // Course content
        const resultFetchCourseContent = await fetchCourseContent(id, { signal: ac.signal });
        setIntro(resultFetchCourseContent.data);
        setCourseContentId(resultFetchCourseContent.data.id);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fetch course detail error:", e);
          setError("Không tải được thông tin khóa học. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (id)loadCourseDetail();
    return () => ac.abort();
  }, [id]);

  // fetch list lesson
  useEffect(() => {
    if (!courseContentId) return; 

    const ac = new AbortController();

    async function loadListLesson() {
      try {
        setLoading(true);
        setError("");

        const resultFetchListLesson = await fetchListLessons(courseContentId, { signal: ac.signal });
        setListLesson(resultFetchListLesson.data);

      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fetch lesson detail error:", e);
          setError("Không tải được thông tin bài học. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadListLesson();
    return () => ac.abort();

  }, [courseContentId]);

  // fetch reviews
  useEffect(() => {
    const ac = new AbortController();

    async function loadReviews(){
      try {
        setLoading(true);
        setError("");

        // Course detail
        const resultFetchReview = await fetchCourseReviews(id, { signal: ac.signal });
        setListReview(resultFetchReview.data);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Fetch reviews error:", e);
          setError("Không tải được đánh giá. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
    return () => ac.abort();
  }, [id]);
  
  const content = useMemo(() => {
    if (loading) {
      return (
        <Section>
          <div className="px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video rounded-2xl border bg-slate-100 animate-pulse" />
                <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="lg:col-span-1">
                <div className="h-[280px] rounded-2xl border bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </Section>
      );
    }
    if (error) {
      return (
        <Section>
          <div className="px-6 lg:px-12">
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>
            <div className="mt-4">
              <button
                className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50"
                onClick={() => navigate(-1)}
              >
                Quay lại
              </button>
            </div>
          </div>
        </Section>
      );
    }
    if (!course) return null;

    return (
      <>
        <Hero course={course} isEnrolledState={isEnrolledState}/>
        {intro && (
          <Section id="intro" title="Giới thiệu khóa học">
            <div className="lg:col-span-2 rounded-2xl border p-6 bg-white">
              <p className="text-slate-700 whitespace-pre-line">{intro.introduce || "Chưa có nội dung mô tả."}</p>
            </div>
          </Section>
        )}
        <Section id="lessons" title="Danh sách bài học">
          <ListLesson 
            isEnrolledState={isEnrolledState}
            listLesson={listLesson} 
            courseContentId={courseContentId} 
            courseId={id} 
          />
        </Section>
        <Section id="reviews" title="Đánh giá khóa học">
          <ListReview 
            hasReviewed={hasReviewed}
            isEnrolledState={isEnrolledState} 
            listReview={listReview} 
            courseId={id} 
          />
        </Section>
      </>
    );
  }, [loading, error, course, intro, isEnrolledState, listLesson, courseContentId, id, listReview, hasReviewed, navigate]);

  return (
    <>
      {content}
    </>
  );
}


export default CourseDetail