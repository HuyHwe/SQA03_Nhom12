import { useState, useEffect } from "react";
import { fetchExamResults } from "../../../../../api/exams.api";
import { Link } from "react-router-dom";

function HistoryExam({examId}){
    const [examResults, setExamResults] = useState([]);

    useEffect(() => {
        (async () => {
            const results = await fetchExamResults(examId);
            setExamResults(results.data);
        })();
    }, [examId]);

    return (
        <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Lịch sử làm bài</h2>

            {examResults.length === 0 ? (
                <p className="text-gray-700">None</p>
            ) : (
                <ul className="space-y-4">
                    {examResults.map((result) => (
                        <li key={result.submissionExamId} className="border-b pb-2">
                            <p>Submitted At: {new Date(result.submittedAt + "Z").toLocaleString()}</p>
                            <div className="flex gap-4 mt-1">
                                <p className="flex-1">Score: {parseFloat(result.score.toFixed(2))}</p>
                                <Link className="flex" to={`/s/results/${result.examAttemptId}`}>Details →</Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default HistoryExam;