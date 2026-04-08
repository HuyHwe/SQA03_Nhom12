import { Trash2, Plus } from "lucide-react";

function MultiSelectChoice( { question, index, addAnswer, updateAnswer, removeAnswer } ) {
    return (
        <div className="md:col-span-2 mt-4 border rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-700">Multiple Choice Options</p>
                <button 
                    onClick={() => addAnswer(index)}
                    className="text-sm bg-transparent text-blue-600 flex items-center hover:text-blue-800"
                >
                    Thêm đáp án <Plus className="w-4 h-4 ml-1" />
                </button>
            </div>
            <div className="pr-2 space-y-2">
                {question.answers.map((ans, ansIndex) => (
                    <div 
                        key={ansIndex} 
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border"
                    >
                        <input 
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={ans.content}
                            onChange={(e) => updateAnswer(index, ansIndex, "content", e.target.value)}
                            placeholder="Answer text"
                        />
                        <label className="flex items-center gap-4 text-base text-green-700">
                            <input
                                type="checkbox"
                                checked={ans.isCorrect}
                                onChange={(e) =>
                                    updateAnswer(index, ansIndex, "isCorrect", e.target.checked)
                                }
                                className="scale-125"
                            />
                            Correct
                        </label>
                        <button 
                            onClick={() => removeAnswer(index, ansIndex)}
                            className="flex items-center justify-center bg-red-100 rounded-md text-red-800 border border-none hover:bg-red-500 hover:text-white hover:border-red-600 transition-all"
                        >
                            
                            <Trash2 className="text-red-600 hover:text-white" strokeWidth={2} />
                        </button>
                    </div>
                ))}
            </div>
            
        </div>
    )
}

export default MultiSelectChoice;