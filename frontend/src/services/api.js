const API = import.meta.env.VITE_API_URL;

export async function getJobs() {
  const r = await fetch(API + "/api/jobs");
  return r.json();
}

export async function postJob(data) {
  const r = await fetch(API + "/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function deleteJob(id) {
  const r = await fetch(API + "/api/jobs/" + id, {
    method: "DELETE"
  });
  return r.json();
}

export async function saveToken(token, roles, news) {
  const r = await fetch(API + "/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles, news })
  });
  return r.json();
}
