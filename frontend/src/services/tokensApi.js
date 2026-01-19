import { apiPost } from "./api.js";

export async function upsertToken({ token, roles, newsEnabled }) {
  return apiPost("/api/tokens", { token, roles, newsEnabled });
}
