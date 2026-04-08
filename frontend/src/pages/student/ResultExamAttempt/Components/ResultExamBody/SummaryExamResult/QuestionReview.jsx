function QuestionReview( { q, userChoiceIds, idx } ) {
    return (
        <article key={q.id ?? idx} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
                <div className="text-sm text-gray-600">Câu {idx + 1} • {q.score ? `${Number(q.score).toFixed(2)} điểm` : '—'}</div>
                <div className="text-xs text-gray-400">{q.type}</div>
            </div>

            <div className="mt-2 text-base font-medium text-gray-800 whitespace-pre-line">{q.content}</div>

            {Array.isArray(q.choices) && (
                <div className="mt-3 grid gap-2">
                    {q.choices.map((ch, ci) => {
                        const isCorrect = !!ch.isCorrect;
                        const isSelected = userChoiceIds.some(id => String(id) === String(ch.id));

                        const base = 'flex items-center gap-3 p-3 rounded-lg border';
                        const cls = isCorrect
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : (isSelected && !isCorrect)
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-gray-50 border-gray-200 text-gray-700';

                        return (
                            <div key={ch.id ?? ci} className={`${base} ${cls}`}>
                                <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold">
                                    {String.fromCharCode(65 + ci)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{ch.content}</div>
                                    <div className="text-xs text-gray-500 mt-1">{isSelected ? 'Đã chọn' : ''}</div>
                                </div>

                                <div className="text-sm">
                                    {isCorrect && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Đúng</span>}
                                    {!isCorrect && isSelected && <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Sai</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {q.explanation && (
                <div className="mt-3 text-sm text-gray-600">
                    <strong>Giải thích:</strong> {q.explanation}
                </div>
            )}
        </article>
    )
}

export default QuestionReview;