import { baseFetch } from "./baseApi";
import { authHeader } from "../utils/auth";

async function postEnrollCourse(courseId) {
  return baseFetch(`/api/courses/${courseId}/enrollments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
  });
}

async function isEnrolled(courseId) {
  return baseFetch(`/api/courses/${courseId}/enrollments/is-enrolled`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });
}

async function fetchEnrollmentsByStudentId(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.append("keyword", params.keyword);
  if (params.status) searchParams.append("status", params.status);
  if (params.sort) searchParams.append("sort", params.sort);

  if (params.page) searchParams.append("page", params.page);
  if (params.pageSize) searchParams.append("pageSize", params.pageSize);

  const queryString = searchParams.toString();
  return baseFetch(
    `/api/courses/student/enrolled-courses${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        ...authHeader(),
      },
    }
  );
}

async function updateProgressEnrollment(courseId, lessonId) {
  try {
    const response = await baseFetch(
      `/api/courses/${courseId}/enrollments/progress`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          ...authHeader(),
        },
        body: JSON.stringify({ LessonId: lessonId }),
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to update progress:", error);
    throw error;
  }
}

export {
  postEnrollCourse,
  isEnrolled,
  fetchEnrollmentsByStudentId,
  updateProgressEnrollment,
};
