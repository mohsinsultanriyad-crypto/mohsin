import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export async function getJobs() {
  return (await api.get("/api/jobs")).data;
}

export async function createJob(payload) {
  return (await api.post("/api/jobs", payload)).data;
}

export async function deleteJob(id, email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  return (await api.delete(`/api/jobs/${id}`, { params: { email: cleanEmail } })).data;
}

// Push register (token + roles + news toggle)
export async function registerPush({ token, roles = [], newsEnabled = false }) {
  return (
    await api.post("/api/push/register", {
      token,
      roles,
      newsEnabled,
      platform: "web",
    })
  ).data;
}

// Backend doesn't have /api/news yet in your backend code.
// So Dashboard shows placeholder list until you add backend news endpoint.
// (You asked frontend now; news backend can be added next)
export async function getNews() {
  // If you later add /api/news, just replace this call:
  // return (await api.get("/api/news?limit=10")).data;
  return { items: [] };
}
