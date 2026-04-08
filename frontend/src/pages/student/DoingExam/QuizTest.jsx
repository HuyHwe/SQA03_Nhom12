// src/pages/QuizTest.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchExamById, submitExamAPI } from "../../../api/exams.api";
import { saveCurrentAnswersAPI } from "../../../api/examAttempt";

import HeaderExam from "./Components/HeaderExam";
import ExamBody from "./Components/ExamBody/ExamBody";

function QuizTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // load answers and saved answers
  const [answers, setAnswers] = useState({});

  const attemptId = sessionStorage.getItem("attemptId");

  useEffect(() => {
    if(!attemptId) {
      setErr("No attemptId found. Please start the exam first.");
    }
  }, [attemptId]);

  // fetch data exam
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchExamById(id);
        const data = res.data;
        setExamData(data);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  // Save answers to DB
  const saveAnswers = async () => {
    const formattedAnswers = formatAnswers(answers);

    try {
      await saveCurrentAnswersAPI(attemptId, JSON.stringify(formattedAnswers));
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      return false;
    }
  };

  // submit exam
  const submitExam = async () => {
    const formattedAnswers = formatAnswers(answers);

    try{
      await submitExamAPI(attemptId, JSON.stringify(formattedAnswers));
      alert("Exam submitted successfully!");

      // navigate to another page or show results
      navigate(`/s/results/${attemptId}`);
    } catch(e){
      alert("Failed to submit exam: " + e.message);
      return;
    }
  };

  /* ===== UI ===== */
  if(loading) {
    return <div>Loading...</div>;
  }
  if(err) {
    return <div>Error: {err}</div>;
  }

  return (
    <div className="min-h-screen w-screen max-w-none bg-white text-gray-900">
      {/* Sticky bar */}
      <HeaderExam 
        attemptId={attemptId}
        exam={examData} 
        doSubmit={submitExam} />

      {/* MAIN */}
      <ExamBody 
        attemptId={attemptId}
        loading={loading}
        err={err}
        examId={id}
        answers={answers}
        setAnswers={setAnswers}
        saveAnswers={saveAnswers}
      />

    </div>
  );
}

function formatAnswers(answers) {
    return Object.entries(answers).map(([questionId, choiceIds]) => ({
        questionId,
        choices: choiceIds.map(id => ({ id })),
    }));
}

export default QuizTest;