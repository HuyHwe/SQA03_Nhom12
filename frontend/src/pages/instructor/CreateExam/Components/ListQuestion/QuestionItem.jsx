import { Trash2 } from "lucide-react";

function QuestionItem( {item, index, updateQuestionExam, removeQuestionExam, togglePopup} ) {
    return (
        <div key={index}>
            <textarea 
                value={item.content}
                onChange={(e) => updateQuestionExam(index, "content", e.target.value)}
                placeholder="Nội dung câu hỏi"
                className="rounded-lg w-full border px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-5 py-3 gap-3">
                <label className="text-base text-gray-600 col-span-4">Loại câu hỏi
                    <select 
                        value={item.type} 
                        onChange={(e) => updateQuestionExam(index, "type", e.target.value)} 
                        className="text-base mt-1 w-full rounded-xl border px-3 py-2"
                    >
                        <option value="MultipleChoice">Multiple Choice</option>
                        <option value="TrueFalse">True/False</option>
                        <option value="MultiSelectChoice">Multiple Select Choice</option>
                    </select>
                </label>
                <label className="text-base text-gray-600 col-span-1">Điểm
                    <input 
                        type="number"
                        value={item.score} 
                        min={0}
                        max={3}
                        onChange={(e) => updateQuestionExam(index, "score", e.target.value)} 
                        className="text-base mt-1 w-full rounded-xl border px-3 py-2"
                    />
                </label>
            </div>
            <div className="flex place-content-between">
                <button 
                    onClick={() => togglePopup(index)}
                    className="rounded-lg flex-start border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                >
                    Detail Question
                </button>
                <button
                    onClick={() => removeQuestionExam(index)}
                    className="rounded-lg flex-end border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4 bg-transparent text-rose-600" />{" "}
                    Xoá
                </button>
            </div>
        </div>
    )
}

export default QuestionItem;