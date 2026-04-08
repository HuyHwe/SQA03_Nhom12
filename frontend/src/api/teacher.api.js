import { baseFetch } from "./baseApi";
import { authHeader } from "../utils/auth";

async function fetchOverviewTeacher() {
  try {
    const response = await baseFetch(`/api/teacher/overview`, {
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
    console.error("Fetch overview teacher error:", error);
    throw new Error(error);
  }
}

export { fetchOverviewTeacher };
