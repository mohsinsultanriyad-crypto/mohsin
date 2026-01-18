const BASE = import.meta.env.VITE_API_URL;

async function j(url, opts = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Request failed");
  }
  return res.json();
}

export const api = {
  // jobs
  getJobs: () => j("/api/jobs"),
  postJob: (body) => j("/api/jobs", { method: "POST", body: JSON.stringify(body) }),
  viewJob: (id) => j(`/api/jobs/${id}/view`, { method: "PATCH" }),
  mine: (email) => j(`/api/jobs/mine?email=${encodeURIComponent(email)}`),
  deleteJob: (id, email) => j(`/api/jobs/${id}`, { method: "DELETE", body: JSON.stringify({ email }) }),

  // alerts
  register: (body) => j("/api/alerts/register", { method: "POST", body: JSON.stringify(body) }),
  alertJobs: (token) => j(`/api/alerts/jobs?token=${encodeURIComponent(token)}`),
  getBadge: (token) => j(`/api/alerts/badge?token=${encodeURIComponent(token)}`),
  resetBadge: (token) => j("/api/alerts/reset-badge", { method: "POST", body: JSON.stringify({ token }) }),

  // news
  getNews: () => j("/api/news")
};
