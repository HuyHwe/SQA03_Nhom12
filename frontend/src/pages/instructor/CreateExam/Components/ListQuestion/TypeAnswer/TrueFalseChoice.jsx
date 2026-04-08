function TrueFalseChoice( { question, index, updateAnswer } ) {
    return (
        <div className="md:col-span-2 mt-4 border rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-700">True/False</p>
            </div>
            <div className="pr-2 space-y-2">
                {question.answers.map((ans, ansIndex) => (
                    <div 
                        key={ansIndex}
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border"
                    >
                        <label className={`flex items-center gap-4 text-base ${ans.isCorrect ? "text-green-700" : "text-red-700"}`}>
                            <input
                                type="radio"
                                name={`truefalse-${index}`}
                                checked={question.answers[ansIndex]?.isCorrect}
                                onChange={() => {
                                    question.answers.forEach((_, i) => {
                                        updateAnswer(index, i, "isCorrect", i === ansIndex);
                                    });
                                }}
                                className="scale-125"
                            />
                            {ans.content}
                        </label>
                    </div>
                ))}
                
            </div>
        </div>
    )
}

export default TrueFalseChoice;