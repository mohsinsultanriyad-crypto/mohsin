const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  alert("VITE_API_URL missing in frontend env");
}

// ---------- JOBS ---------- //

export async function getJobs() {
  const res = await fetch(`${API_BASE}/api/jobs`);
  return await res.json();
}

export async function createJob(data) {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteJob(id, email) {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function incrementView(id) {
  await fetch(`${API_BASE}/api/jobs/${id}/view`, {
    method: "POST",
  });
}

// ---------- NEWS ---------- //

export async function getNews() {
  const res = await fetch(`${API_BASE}/api/news`);
  return await res.json();
}

// ---------- PUSH ---------- //

export async function saveToken(token, roles, newsEnabled) {
  await fetch(`${API_BASE}/api/push/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles, newsEnabled }),
  });
}
