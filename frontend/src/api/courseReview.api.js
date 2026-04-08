import { baseFetch } from "./baseApi";
import { authHeader } from "../utils/auth";

async function fetchCourseReviews(courseId) {
  return baseFetch(`/api/${courseId}/reviews`);
}

async function postCourseReview(courseId, reviewData) {
  return baseFetch(`/api/${courseId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(reviewData),
  });
}

async function hasReviewedCourse(courseId) {
  return baseFetch(`/api/${courseId}/reviews/has-reviewed`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });
}

export { fetchCourseReviews, postCourseReview, hasReviewedCourse };
