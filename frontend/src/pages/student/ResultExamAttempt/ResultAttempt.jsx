/* eslint-disable no-unused-vars */
// src/pages/ResultAttempt.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Hero from "./Components/Hero";
import ResultExamBody from "./Components/ResultExamBody/ResultExamBody";

function exportCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ResultAttempt() {
  const { attemptId } = useParams(); // id của attempt trong URL hiển thị
  const location = useLocation();

  // const onExportCSV = () => {
  //   const rows = [["num", "question", "selected_labels", "correct_labels", "is_correct"]];
  //   reviewQuestions.forEach((q) => {
  //     const pickedIds = choiceIdsFromAnswerVal(clientAnswers[q.num]);
  //     const pickedLabels = pickedIds.map((id) => choiceLabelMap.get(id) || id).join(" | ");
  //     const correctLabels = q.correctIds.map((id) => choiceLabelMap.get(id) || id).join(" | ");
  //     const ok = isAnswerCorrect(pickedIds, q.correctIds) ? "1" : "0";
  //     rows.push([q.num, q.question, pickedLabels, correctLabels, ok]);
  //   });
  //   exportCSV(`result_${attemptId || "attempt"}.csv`, rows);
  // };

  const onExportCSV = () => {console.log("Export CSV clicked");};

  return (
    <div className="min-h-screen w-screen max-w-none bg-white">
      <Hero />

      <ResultExamBody
        onExportCSV={onExportCSV}
        attemptId={attemptId}
      />

    </div>
  );
}

export default ResultAttempt;