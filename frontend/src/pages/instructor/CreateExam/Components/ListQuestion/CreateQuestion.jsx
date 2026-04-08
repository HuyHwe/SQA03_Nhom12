import { Eye, X } from "lucide-react";
import { useState } from "react";

import MultiSelectChoice from "./TypeAnswer/MultiSelectChoice";
import TrueFalseChoice from "./TypeAnswer/TrueFalseChoice";
import MultipleChoice from "./TypeAnswer/MultipleChoice";

function CreateQuestion({
    question,
    updateQuestion,
    addAnswer,
    updateAnswer,
    removeAnswer,
    index, 
    openPopupDetailQuestion, setOpenPopupDetailQuestion
}) {
    const [, setShowCreate] = useState(true);
    if (!openPopupDetailQuestion) return null;
    const handleShowPreview = () => {
        console.log("Preview question:", question);
        setShowCreate((prev) => !prev);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="overflow-y-auto max-h-[80vh] absolute inset-x-0 top-[8vh] mx-auto w-[min(880px,94vw)] rounded-2xl border bg-white shadow-xl">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                    <div className="font-bold text-gray-900">Tạo câu hỏi mới</div>
                    <button
                        onClick={handleShowPreview}
                        className="rounded-lg border px-3 py-2 text-sm bg-transparent hover:bg-gray-50 inline-flex items-center gap-2"
                    >
                        Show Preview <Eye className="w-4 h-4 inline-block ml-1" />
                    </button>
                    <button 
                        onClick={() => {setOpenPopupDetailQuestion(false)}} 
                        className="text-gray-500 bg-transparent border-none hover:bg-gray-300 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="text-base text-gray-600">Loại câu hỏi</label>
                            <select 
                                value={question.type} 
                                onChange={(e) => {
                                    updateQuestion(index, "type", e.target.value)
                                    updateQuestion(index, "answers", [])
                                    if(e.target.value === "TrueFalse"){
                                        updateQuestion(index, "answers", [
                                            {content: "True", isCorrect: true},
                                            {content: "False", isCorrect: false}
                                        ])
                                    }
                                }} 
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                            >
                                <option value="MultipleChoice">Multiple Choice</option>
                                <option value="TrueFalse">True/False</option>
                                <option value="MultiSelectChoice">Multiple Select Choice</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-base text-gray-600">Ảnh câu hỏi</label>
                            <input 
                                placeholder="Image URL"
                                value={question.imageUrl} 
                                onChange={(e)=>updateQuestion(index, "imageUrl", e.target.value)} 
                                className="mt-1 w-full rounded-xl border px-3 py-2" 
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-base text-gray-600">Đề bài</label>
                        <textarea
                            rows={3}
                            value={question.content}
                            onChange={(e)=>updateQuestion(index, "content", e.target.value)}
                            placeholder="Nhập đề bài..."
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-base text-gray-600">Giải thích</label>
                        <textarea
                            rows={3}
                            value={question.explanation}
                            onChange={(e)=>updateQuestion(index, "explanation", e.target.value)}
                            placeholder="Nhập giải thích..."
                            className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {question.type === "MultiSelectChoice" && 
                        <MultiSelectChoice 
                            question={question}
                            index={index}
                            addAnswer={addAnswer}
                            updateAnswer={updateAnswer}
                            removeAnswer={removeAnswer}
                        />
                    }

                    {question.type === "TrueFalse" && 
                        <TrueFalseChoice
                            question={question}
                            index={index}
                            updateAnswer={updateAnswer}
                        />
                    }

                    {question.type === "MultipleChoice" && 
                        <MultipleChoice
                            question={question}
                            index={index}
                            addAnswer={addAnswer}
                            updateAnswer={updateAnswer}
                            removeAnswer={removeAnswer}
                        />
                    }
                </div>
            </div>
        </div>
    )
}

export default CreateQuestion;