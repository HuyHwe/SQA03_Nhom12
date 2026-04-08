import { api } from "../lib/api";
import { baseFetch } from "./baseApi";
import { authHeader } from "../utils/auth";

export const approveCourse = async (courseId) => {
  const response = await api.patch(`/api/admin/courses/${courseId}/approve`);
  return response.data;
};

export const rejectCourse = async (courseId, reason) => {
  const response = await api.patch(`/api/admin/courses/${courseId}/reject`, {
    reason: reason,
  });
  return response.data;
};

// Additional endpoints can be added as backend implements them
async function adminLogin(email, password) {
  try {
    const response = await baseFetch(`/api/Auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "*/*" },
      body: JSON.stringify({ email, password }),
    });
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    throw new Error(error);
  }
}

async function getCoursesByStatusByAdmin(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append("status", params.status);
    if (params.page) searchParams.append("page", params.page);
    if (params.pageSize) searchParams.append("pageSize", params.pageSize);
    const queryString = searchParams.toString();

    const response = await baseFetch(
      `/api/admin/courses${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          ...authHeader(),
        },
      }
    );
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Get courses by status error:", error);
    throw new Error(error);
  }
}

async function getFullCourseById(courseId) {
  try {
    const response = await baseFetch(`/api/admin/full-course/${courseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        ...authHeader(),
      },
    });
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Get full course by ID error:", error);
    throw new Error(error);
  }
}

async function occupyReviewSlot(courseId) {
  try {
    const response = await baseFetch(
      `/api/admin/${courseId}/admin-review-course`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          ...authHeader(),
        },
      }
    );
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Occupy review slot error:", error);
    throw new Error(error);
  }
}

async function adminGetLessonById(courseId, lessonId) {
  try {
    const response = await baseFetch(
      `/api/admin/${courseId}/lessons/${lessonId}/admin-review-lesson`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          ...authHeader(),
        },
      }
    );
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Get lesson by ID error:", error);
    throw new Error(error);
  }
}

async function adminApproveCourse(courseId) {
  try {
    const response = await baseFetch(`/api/admin/courses/${courseId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        ...authHeader(),
      },
    });
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Admin approve course error:", error);
    throw new Error(error);
  }
}

async function adminRejectCourse(courseId, reason) {
  try {
    const response = await baseFetch(`/api/admin/courses/${courseId}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        ...authHeader(),
      },
      body: JSON.stringify({ RejectReason: reason }),
    });
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
  } catch (error) {
    console.error("Admin reject course error:", error);
    throw new Error(error);
  }
}

export {
  adminLogin,
  getCoursesByStatusByAdmin,
  getFullCourseById,
  occupyReviewSlot,
  adminGetLessonById,
  adminApproveCourse,
  adminRejectCourse,
};
