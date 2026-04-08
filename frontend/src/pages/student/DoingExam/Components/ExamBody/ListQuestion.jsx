import QuestionItem from "./QuestionItem";

function ListQuestion({ listQuestions, answers, setAnswers }) {
    return (
        <section className="space-y-8">
            {listQuestions.map((q, idx) => (
                <QuestionItem
                    key={q.id ?? idx}
                    q={q}
                    idx={idx}
                    selectedChoices={answers[q.id] || []}
                    onToggleChoice={(questionId, choiceId, qType) => {
                        setAnswers((prev) => {
                            const prevChoices = prev[questionId] || [];
                            let nextChoices = [];
                            if (qType === 'MultiSelectChoice') {
                                if (prevChoices.includes(choiceId)) {
                                    nextChoices = prevChoices.filter((c) => c !== choiceId);
                                } else {
                                    nextChoices = [...prevChoices, choiceId];
                                }
                            } else {
                                // MultipleChoice or default -> single select
                                nextChoices = [choiceId];
                            }
                            return { ...prev, [questionId]: nextChoices };
                        });
                    }}
                />
            ))}
        </section>
    )
}

export default ListQuestion;