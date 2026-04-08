import { useState } from "react";

function useExamInfor() {
  const [examInfor, setExamInfor] = useState({
    title: "",
    description: "",
    durationMinutes: 0,
    courseContentId: "",
    lessonId: "",
  });

  const updateExamInfor = (field, value) => {
    setExamInfor((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setAllExamInfor = (data) => {
    setExamInfor((prev) => ({
      ...prev,
      ...data,
    }));
  };

  return { examInfor, updateExamInfor, setAllExamInfor };
}

export { useExamInfor };
