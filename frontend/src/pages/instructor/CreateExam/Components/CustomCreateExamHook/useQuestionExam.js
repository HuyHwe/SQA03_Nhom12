import { useState } from "react";

const newQuestion = {
  content: "",
  imageUrl: "",
  type: "MultipleChoice",
  explanation: "",
  score: 1,
  isRequired: false,
  answers: [],
};

const newAnswer = {
  content: "",
  isCorrect: false,
};

function useQuestionExam() {
  const [questions, setQuestions] = useState([]);

  const setAllQuestions = (data) => {
    setQuestions(data);
  };

  const addQuestionExam = () => {
    setQuestions((prev) => [...prev, { ...newQuestion, order: prev.length }]);
  };

  const removeQuestionExam = (questionIndex) => {
    setQuestions((prev) => {
      const filteredQuestions = prev.filter(
        (_, index) => index !== questionIndex
      );
      return filteredQuestions.map((q, index) => ({
        ...q,
        order: index,
      }));
    });
  };

  const updateQuestionExam = (questionIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === questionIndex ? { ...q, [field]: value } : q
      )
    );
  };

  const moveQuestionExam = (oldIndex, newIndex) => {
    setQuestions((prev) => {
      const questionsCopy = [...prev];
      const [movedQuestion] = questionsCopy.splice(oldIndex, 1);
      questionsCopy.splice(newIndex, 0, movedQuestion);

      return questionsCopy.map((q, index) => ({
        ...q,
        order: index,
      }));
    });
  };

  const addAnswer = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === questionIndex
          ? {
              ...q,
              answers: [...q.answers, { ...newAnswer }],
            }
          : q
      )
    );
  };

  const updateAnswer = (questionIndex, answerIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === questionIndex
          ? {
              ...q,
              answers: q.answers.map((ans, ansIndex) =>
                ansIndex === answerIndex ? { ...ans, [field]: value } : ans
              ),
            }
          : q
      )
    );
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    setQuestions((prev) =>
      prev.map((q, index) =>
        index === questionIndex
          ? {
              ...q,
              answers: q.answers.filter(
                (_, ansIndex) => ansIndex !== answerIndex
              ),
            }
          : q
      )
    );
  };

  return {
    questions,
    setAllQuestions,
    addQuestionExam,
    removeQuestionExam,
    updateQuestionExam,
    moveQuestionExam,
    addAnswer,
    updateAnswer,
    removeAnswer,
  };
}

export { useQuestionExam };
