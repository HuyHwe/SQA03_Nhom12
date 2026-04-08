// categories API
import { baseFetch } from "./baseApi";

export async function getCategories() {
  return baseFetch("/api/categories");
}
