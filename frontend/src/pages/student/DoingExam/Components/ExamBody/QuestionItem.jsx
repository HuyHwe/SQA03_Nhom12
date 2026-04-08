import fallbackImage from '../../../../../assets/images/fallback-image.jpeg';

function QuestionItem({ q, idx, selectedChoices = [], onToggleChoice = () => {} }) {
    const isMulti = q?.type === 'MultiSelectChoice';

    return (
        <article
            key={q.id ?? idx}
            id={`q-${idx + 1}`}
            className="bg-white border rounded-2xl p-5"
        >
            <div className="flex items-start justify-between">
                <div className="text-2xl font-semibold text-gray-700">Câu {idx + 1} : {q.score ? `${Number(q.score).toFixed(2)} điểm` : '—'}</div>
                <div className="text-sm text-gray-400">{q.type}</div>
            </div>

            <div className="mt-2 text-xl text-gray-800 font-medium whitespace-pre-line">{q.content}</div>

            {q.imageUrl && (
                <img 
                    src={q.imageUrl} 
                    alt={`q-${idx + 1}`} 
                    className="mt-3 max-w-[1000px] max-h-[500px] mx-auto object-contain rounded shadow" 
                    onError={(e) => e.currentTarget.src = fallbackImage}
                />
            )}

            {Array.isArray(q.choices) && q.choices.length > 0 && (
                <div className="mt-4 grid gap-2">
                    {q.choices.map((ch, ci) => {
                        const selected = Array.isArray(selectedChoices) && selectedChoices.includes(ch.id);
                        return (
                            <button
                                key={ch.id ?? ci}
                                type="button"
                                onClick={() => onToggleChoice(q.id, ch.id, q.type)}
                                className={`flex items-center gap-3 p-3 border rounded-lg transition text-sm ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                aria-pressed={selected}
                            >
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${selected ? 'bg-white text-indigo-600 font-bold' : 'text-gray-700'}`}>
                                    {isMulti ? (selected ? '✓' : String.fromCharCode(65 + ci)) : String.fromCharCode(65 + ci)}
                                </div>
                                <div className="text-sm text-inherit">{ch.content}</div>
                            </button>
                        )
                    })}
                </div>
            )}
        </article>
    )
}

export default QuestionItem;