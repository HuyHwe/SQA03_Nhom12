class response {
  constructor(ok, reason = "") {
    this.ok = ok;
    this.reason = reason;
  }
}

const checkExamCreate = (exam, questions, courseId) => {
  if (!exam.title || exam.title.trim() === "") {
    return new response(false, "Tiêu đề bài kiểm tra không được để trống.");
  }

  if (!exam.description || exam.description.trim().length < 10) {
    return new response(false, "Mô tả bài kiểm tra phải có ít nhất 10 ký tự.");
  }

  if (
    exam.durationMinutes == null ||
    exam.durationMinutes <= 0 ||
    exam.durationMinutes > 300 ||
    !Number.isInteger(exam.durationMinutes)
  ) {
    return new response(
      false,
      "Thời lượng bài kiểm tra phải là số nguyên từ 1 đến 300 phút."
    );
  }

  if (courseId && !exam.courseContentId && !exam.lessonId) {
    return new response(
      false,
      "Vui lòng chọn một khoá học hoặc bài học để liên kết với bài kiểm tra."
    );
  }

  if (!questions || questions.length === 0) {
    return new response(false, "Bài kiểm tra phải có ít nhất một câu hỏi.");
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.content || q.content.trim() === "") {
      return new response(
        false,
        `Câu hỏi thứ ${i + 1} không được để trống nội dung.`
      );
    }
    if (
      q.score == null ||
      q.score <= 0 ||
      q.score >= 5 ||
      !Number.isInteger(q.score)
    ) {
      return new response(
        false,
        `Câu hỏi thứ ${i + 1} phải có điểm số hợp lệ (lớn hơn 0 và nhỏ hơn 5).`
      );
    }

    var isCorrectExist = q.answers.some((answer) => answer.isCorrect);
    if (!isCorrectExist) {
      return new response(
        false,
        `Câu hỏi thứ ${i + 1} phải có ít nhất một phương án đúng.`
      );
    }

    if (!q.explanation || q.explanation.trim() === "") {
      return new response(
        false,
        `Câu hỏi thứ ${i + 1} phải có phần giải thích đáp án.`
      );
    }

    if (q.answers.length < 2) {
      return new response(
        false,
        `Câu hỏi thứ ${i + 1} phải có ít nhất hai phương án trả lời.`
      );
    }

    for (let j = 0; j < q.answers.length; j++) {
      const ans = q.answers[j];

      if (!ans.content || ans.content.trim() === "") {
        return new response(
          false,
          `Câu hỏi thứ ${i + 1}, phương án thứ ${
            j + 1
          } không được để trống nội dung.`
        );
      }
    }
  }

  return new response(true);
};

export default checkExamCreate;
