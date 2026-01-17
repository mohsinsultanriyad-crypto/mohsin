const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") ||
  "https://mohsin-wmgw.onrender.com";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  // try parse json
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// Jobs
export const apiGetJobs = () => request("/api/jobs");
export const apiGetJobById = (id) => request(`/api/jobs/${id}`);
export const apiPostJob = (payload) =>
  request("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
export const apiViewJob = (id) =>
  request(`/api/jobs/${id}/view`, { method: "POST" });
export const apiDeleteJob = (id, email) =>
  request(`/api/jobs/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ email }),
  });

// News
export const apiGetNews = () => request("/api/news");

export { API_BASE };
