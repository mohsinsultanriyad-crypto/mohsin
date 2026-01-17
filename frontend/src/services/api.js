const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function getMeta() {
  const r = await fetch(`${BASE}/api/meta`);
  return r.json();
}

export async function getJobs({ limit = 20, skip = 0 } = {}) {
  const r = await fetch(`${BASE}/api/jobs?limit=${limit}&skip=${skip}`);
  return r.json();
}

export async function getJobById(id) {
  const r = await fetch(`${BASE}/api/jobs/${id}`);
  if (!r.ok) throw new Error("job not found");
  return r.json();
}

export async function createJob(payload) {
  const body = {
    ...payload,
    email: String(payload.email || "").trim().toLowerCase(),
    jobRole: String(payload.jobRole || "").trim().toLowerCase()
  };
  const r = await fetch(`${BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Create failed");
  return data;
}

export async function viewJob(id) {
  await fetch(`${BASE}/api/jobs/${id}/view`, { method: "POST" });
}

export async function myPosts(email) {
  const e = String(email || "").trim().toLowerCase();
  const r = await fetch(`${BASE}/api/my-posts?email=${encodeURIComponent(e)}`);
  return r.json();
}

export async function updateJob(id, email, patch) {
  const e = String(email || "").trim().toLowerCase();
  const body = {
    ...patch,
    jobRole: patch.jobRole ? String(patch.jobRole).trim().toLowerCase() : undefined
  };
  const r = await fetch(`${BASE}/api/jobs/${id}?email=${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Update failed");
  return data;
}

export async function deleteJob(id, email) {
  const e = String(email || "").trim().toLowerCase();
  const r = await fetch(`${BASE}/api/jobs/${id}?email=${encodeURIComponent(e)}`, { method: "DELETE" });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.message || "Delete failed");
  return data;
}

export async function getNews() {
  const r = await fetch(`${BASE}/api/news`);
  return r.json();
}

export async function registerPushToken({ token, roles, newsEnabled }) {
  const r = await fetch(`${BASE}/api/push/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles, newsEnabled, platform: "web" })
  });
  return r.json();
}
