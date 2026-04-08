import { useState, useEffect } from "react";
import { fetchQuestionExamsByExamId } from "../../../../../api/questionExams.api";
import { fetchSavedAnswersAPI } from "../../../../../api/examAttempt";
import ListQuestion from "./ListQuestion";
import TrackExamPanel from "./TrackExamPanel";

function ExamBody({ attemptId, loading, err, examId, answers, setAnswers, saveAnswers }) {
    const [listQuestions, setListQuestions] = useState([]);
    const [initialized, setInitialized] = useState(false);
    const [loadStatus, setLoadStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [loadMessage, setLoadMessage] = useState(null);

    // fetch list questions
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                const questions = await fetchQuestionExamsByExamId(examId);
                setListQuestions(questions.data || []);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        })();

        return () => ac.abort();
    }, [examId]);

    // load saved answers: server only (when attemptId present)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (!attemptId) {
                // no attemptId — start with empty answers
                if (!cancelled) {
                    setAnswers({});
                    setInitialized(true);
                    setLoadStatus(null);
                    setLoadMessage(null);
                }
                return;
            }

            setLoadStatus('loading');
            setLoadMessage(null);
            try {
                const res = await fetchSavedAnswersAPI(attemptId);
                const saved = res?.data || {};
                const raw = saved?.savedAnswers;
                let arr = [];
                if (typeof raw === 'string') {
                    try { arr = JSON.parse(raw); } catch { arr = []; }
                } else if (Array.isArray(raw)) {
                    arr = raw;
                }

                const map = {};
                arr.forEach((it) => {
                    const qid = it.questionId;
                    const choiceIds = Array.isArray(it.choices)
                        ? it.choices.map((c) => c.id).filter(Boolean)
                        : [];
                    if (qid) map[qid] = choiceIds;
                });

                if (!cancelled) {
                    setAnswers(map);
                    setLoadStatus('success');
                    setLoadMessage('Loaded answers from server.');
                }
            } catch (err) {
                console.error('Failed to fetch saved answers from server:', err);
                if (!cancelled) {
                    setAnswers({});
                    setLoadStatus('error');
                    setLoadMessage('Cannot load answers from server.');
                }
            } finally {
                if (!cancelled) setInitialized(true);
            }
        })();

        return () => { cancelled = true; };
    }, [attemptId, setAnswers]);

    // persist answers to localStorage whenever they change
    useEffect(() => {
        if (!examId || !initialized) return;
        try {
            const key = `exam_answers_${examId}`;
            const payload = Object.entries(answers).map(([questionId, choiceIds]) => ({
                questionId,
                choices: (choiceIds || []).map((id) => ({ id })),
            }));
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.warn('Failed to save answers', e);
        }
    }, [answers, examId, initialized]);
    
    return (
        <main className="w-full px-6 lg:px-12 py-8">
            {loading && (
            <div className="bg-white border border-[#e0e0e0] rounded-lg p-8 text-center text-sm text-[#677788] mb-8">
                Đang tải câu hỏi…
            </div>
            )}

            {err && !loading && (
            <div className="bg-white border border-red-200 rounded-lg p-8 text-center text-sm text-red-600 mb-8">
                Không thể tải dữ liệu (chi tiết: {err})
            </div>
            )}

            {!loading && !err && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    <ListQuestion
                        listQuestions={listQuestions}
                        answers={answers}
                        setAnswers={setAnswers}
                    />
                    
                    <TrackExamPanel
                        attemptId={attemptId}
                        listQuestions={listQuestions}
                        answers={answers}
                        loadStatus={loadStatus}
                        loadMessage={loadMessage}
                        saveAnswers={saveAnswers}
                    />
                </div>
            )}
        </main>
    )
}

export default ExamBody;