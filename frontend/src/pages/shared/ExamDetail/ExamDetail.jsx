// src/pages/ExamDetail.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchExamById } from "../../../api/exams.api";
import { getRole } from "../../../utils/auth";

// import { clearAttemptsForExam, generateAttemptId } from "../../utils/attempt";
import BackToLesson from "./Components/ExamBody/BackToLesson";
import HeaderExam from "./Components/HeaderExam/HeaderExam";
import ExamBody from "./Components/ExamBody/ExamBody";
import LoadingExam from "./Components/LoadingExam";
import ErrorLoadExam from "./Components/ErrorLoadExam";

const formatDuration = (minutes) => {
  if (typeof minutes !== "number" || isNaN(minutes)) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
};

function ExamDetail() {
  const { id } = useParams();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Fetch exam by id
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchExamById(id);
        const data = res.data;
        setExam(data);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  // fetch another data by role
  const roles = getRole();
  console.log("ExamDetail role =", roles);

  // ---- Not found / error / loading states
  if (loading) return <LoadingExam />;

  if (err) return <ErrorLoadExam err={err} /> 

  return (
    <div className="w-screen max-w-none bg-white">
      <BackToLesson />

      <HeaderExam exam={exam} formatDuration={formatDuration} />

      <ExamBody
        roles={roles}
        exam={exam}
        formatDuration={formatDuration}
      />
    </div>
  );
}

export default ExamDetail;