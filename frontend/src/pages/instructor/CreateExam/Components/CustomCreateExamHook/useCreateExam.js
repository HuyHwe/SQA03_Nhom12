import { useExamInfor } from "./useExamInfor";
import { useQuestionExam } from "./useQuestionExam";

function useCreateExam() {
  const { examInfor, updateExamInfor, setAllExamInfor } = useExamInfor();
  const {
    questions,
    setAllQuestions,
    addQuestionExam,
    removeQuestionExam,
    updateQuestionExam,
    moveQuestionExam,
    addAnswer,
    updateAnswer,
    removeAnswer,
  } = useQuestionExam();

  return {
    examInfor,
    updateExamInfor,
    setAllExamInfor,
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

export { useCreateExam };
