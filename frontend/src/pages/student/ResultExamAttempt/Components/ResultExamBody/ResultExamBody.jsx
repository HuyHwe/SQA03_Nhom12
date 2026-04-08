import { useEffect, useState } from "react";
import { fetchSubmissionExamByAttemmptId } from "../../../../../api/exams.api.js";

import SummaryExamResult from "./SummaryExamResult/SummaryExamResult";
import BreakdownExamResult from "./BreakdownExamResult";

function ResultExamBody( { 
  onExportCSV,
  attemptId} )   {
    const [submissionExam, setSubmissionExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try{
                const result = await fetchSubmissionExamByAttemmptId(attemptId);
                setSubmissionExam(result.data);
                setLoading(false);
            } catch (e) {
                console.error("Fetch submission exam error:", e);
                setErr(e.message || "Unknown error");
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [attemptId]);

    if (!submissionExam) {
        return <div>Loading...</div>;
    }

    return (
      <main className="w-full px-6 lg:px-12 py-8">
        {loading && (
          <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center text-sm text-[#677788] mb-8">
            Đang tải kết quả…
          </div>
        )}

        {err && !loading && (
          <div className="bg-white border border-red-200 rounded-lg p-8 text-center text-sm text-red-600 mb-8">
            Không thể tải dữ liệu (chi tiết: {err})
          </div>
        )}

        {!loading && !err && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* LEFT: Summary + Review */}
            <SummaryExamResult 
              onExportCSV={onExportCSV}
              submissionExam={submissionExam}
            />

            {/* RIGHT: Breakdown (đơn giản theo toàn bài) */}
            <BreakdownExamResult submissionExam={submissionExam}/>
          </div>
        )}
      </main>
    )
}

export default ResultExamBody;