import { authHeader } from "../utils/auth";
import { baseFetch } from "./baseApi";

async function fetchListLessons(courseContentId) {
  return baseFetch(`/api/course-contents/${courseContentId}/lessons`);
}

async function fetchLessonDetail(lessonId, courseContentId) {
  try {
    const response = await baseFetch(
      `/api/course-contents/${courseContentId}/lessons/${lessonId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
      }
    );

    if (response.status === "error") {
      // not enrolled
      if (response.status === 403 || response.status === 401) {
        throw new Error("Bạn chưa ghi danh vào khóa học này");
      }
      throw new Error(response.message || "Lỗi không xác định");
    }
    return response;
  } catch (e) {
    console.error("Fetch lesson detail error:", e);
    throw new Error(e);
  }
}

async function createLesson(courseContentId, payload) {
  return baseFetch(`/api/course-content/${courseContentId}/lessons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
}

async function createLessonsBatch(courseContentId, lessonsArray) {
  // Create lessons in parallel using Promise.all
  const promises = lessonsArray.map((lesson) =>
    createLesson(courseContentId, lesson)
  );
  return Promise.all(promises);
}

export { fetchListLessons, fetchLessonDetail, createLesson, createLessonsBatch };
