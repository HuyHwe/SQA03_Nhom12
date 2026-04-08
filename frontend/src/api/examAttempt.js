import { baseFetch } from "./baseApi";
import { authHeader } from "../utils/auth";

async function postExamAttempt(examId) {
  return baseFetch(`/api/exams/${examId}/attempt/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
  });
}

async function getEndTime(attemptId) {
  try {
    const response = await baseFetch(`/api/exam-attempt/${attemptId}/attempt`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    if (response.status === "error") {
      throw new Error(response.message || "Lỗi không xác định");
    }

    return response.data.endTime;
  } catch (e) {
    console.error("Fetch end time error:", e);
    throw new Error(e);
  }
}

async function saveCurrentAnswersAPI(attemptId, currentAnswers) {
  return baseFetch(`/api/exam-attempt/${attemptId}/save-answers`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(currentAnswers),
  });
}

async function fetchSavedAnswersAPI(attemptId) {
  try {
    const response = await baseFetch(
      `/api/exam-attempt/${attemptId}/fetch-saved-answers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
      }
    );

    if (response.status === "error") {
      throw new Error(response.message || "Lỗi không xác định");
    }

    return response;
  } catch (e) {
    console.error("Fetch saved answers error:", e);
    throw new Error(e);
  }
}

export {
  postExamAttempt,
  saveCurrentAnswersAPI,
  fetchSavedAnswersAPI,
  getEndTime,
};
