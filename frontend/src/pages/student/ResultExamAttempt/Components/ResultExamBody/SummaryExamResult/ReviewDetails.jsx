import { useState, useEffect } from "react";
import { fetchQuestionExamsForReviewByExamId } from "../../../../../../api/questionExams.api";
import { fetchUserSubmissionBySubmissionexamId } from "../../../../../../api/exams.api";
import QuestionReview from "./QuestionReview";

function ReviewDetails( {submissionExam} ) {
    const [listQuestions, setListQuestions] = useState([]);
    const [userResult, setUserResult] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ac = new AbortController();

        async function load() {
            try {
                setLoading(true);

                const [questionsRes, submissionRes] = await Promise.all([
                    fetchQuestionExamsForReviewByExamId(submissionExam.examId),
                    fetchUserSubmissionBySubmissionexamId(submissionExam.submissionExamId)
                ]);

                // fetch questions
                setListQuestions(questionsRes.data || []);

                // fetch user answers
                const parsed = Array.isArray(submissionRes.data)
                                ? submissionRes.data
                                : JSON.parse(submissionRes.data || "[]");
                setUserResult(parsed);

            } catch (error) {
                console.error(error);
                setUserResult([]);
                setListQuestions([]);
            } finally {
                setLoading(false);
            }
        }

        load();

        return () => ac.abort();
    }, [submissionExam.examId, submissionExam.submissionExamId]);

    if (loading || !userResult) {
        return <div>Loading review details...</div>;
    }

    const findSubmissionFor = (questionId) => {
        if (!Array.isArray(userResult)) return [];
        const entry = userResult.find((e) => String(e.questionId) === String(questionId));
        if (!entry) return [];
        return Array.isArray(entry.choices) ? entry.choices.map((c) => c.id) : [];
    };

    return (
        <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Review Panel</h3>

            {listQuestions.length === 0 && (
                <div className="text-sm text-gray-500">Không có câu hỏi để review.</div>
            )}

            <div className="space-y-6">
                {listQuestions.map((q, idx) => {
                    const userChoiceIds = findSubmissionFor(q.id);
                    // eslint-disable-next-line no-unused-vars
                    const totalCorrect = (q.choices || []).filter(c => c.isCorrect).length;

                    return <QuestionReview key={q.id ?? idx} q={q} userChoiceIds={userChoiceIds} idx={idx} />;
                })}
            </div>
        </div>
    )
}

export default ReviewDetails;