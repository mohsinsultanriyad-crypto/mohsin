import { apiGet } from "./api.js";

export async function fetchNews(limit = 30) {
  const data = await apiGet(`/api/news?limit=${encodeURIComponent(limit)}`);
  return data.news || [];
}
