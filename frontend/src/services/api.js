const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// ✅ Get all jobs
export async function getJobs() {
  const res = await fetch(`${API_BASE}/api/jobs`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

// Post new job
export async function postJob(data) {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to post job");
  return res.json();
}

// Delete job
export async function deleteJob(id, email) {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to delete job");
  return res.json();
}

// News
export async function getNews() {
  const res = await fetch(`${API_BASE}/api/news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

// Save push token
export async function saveToken(token, roles, newsEnabled) {
  await fetch(`${API_BASE}/api/push/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles, newsEnabled }),
  });
}
