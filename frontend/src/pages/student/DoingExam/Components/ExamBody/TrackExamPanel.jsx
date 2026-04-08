import { useState, useEffect } from 'react';

function TrackExamPanel({ attemptId, listQuestions, answers, loadStatus = null, loadMessage = null, saveAnswers }) {
    
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', text }

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    async function handleSave() {
        if (!attemptId) {
            setToast({ type: 'error', text: 'Attempt id missing. Failed to save.' });
            return;
        }
        setSaving(true);
        const ok = await saveAnswers();
        setSaving(false);
        if (ok) setToast({ type: 'success', text: 'Saved current answers successfully.' });
        else setToast({ type: 'error', text: 'Failed to save current answers.' });
    }

    return (
        <aside className="space-y-4 lg:sticky lg:top-[64px] h-fit">
            <div className="bg-white border rounded-2xl p-5 relative">
                <h4 className="font-semibold text-gray-900 mb-3">Danh sách câu hỏi</h4>

                {loadStatus === 'loading' && (
                    <div className="text-xs text-blue-600 mb-2">Đang tải đáp án đã lưu...</div>
                )}
                {loadStatus === 'success' && (
                    <div className="text-xs text-green-600 mb-2">{loadMessage || 'Loaded answers from server.'}</div>
                )}
                {loadStatus === 'error' && (
                    <div className="text-xs text-red-600 mb-2">{loadMessage || 'Can not load answers from server.'}</div>
                )}

                <div className="grid grid-cols-8 gap-10">
                    {listQuestions.map((q, i) => {
                        const answered = Array.isArray(answers[q.id]) && answers[q.id].length > 0;
                        return (
                            <button
                                key={q.id ?? i}
                                type="button"
                                onClick={() => document.getElementById(`q-${i+1}`)?.scrollIntoView({ behavior: 'smooth' })}
                                className={`w-9 h-9 rounded-lg text-sm font-semibold transition flex items-center justify-center ${answered ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                {/* <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Đã lưu (local)</div>
                    <pre className="text-xs p-2 bg-gray-50 rounded max-h-48 overflow-auto">
                        {JSON.stringify(formattedAnswers, null, 2)}
                    </pre>
                </div> */}
                
                <button 
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mt-4 w-full" 
                    onClick={handleSave}
                    disabled={saving}
                >{saving ? 'Đang lưu...' : 'Lưu bài làm hiện tại'}</button>

                {toast && (
                    <div className={`absolute right-4 top-4 px-3 py-2 rounded text-sm ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.text}
                    </div>
                )}
            </div>

        </aside>
    )
}

export default TrackExamPanel;