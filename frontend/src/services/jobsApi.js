import { apiGet, apiPost, apiPatch, apiDelete } from "./api.js";

export async function fetchJobs() {
  const data = await apiGet("/api/jobs");
  return data.jobs || [];
}

export async function postJob(payload) {
  const data = await apiPost("/api/jobs", payload);
  return data.job;
}

export async function viewJob(id) {
  await apiPost(`/api/jobs/${id}/view`, {});
}

export async function updateJob(id, payload) {
  const data = await apiPatch(`/api/jobs/${id}`, payload);
  return data.job;
}

export async function deleteJob(id, email) {
  return apiDelete(`/api/jobs/${id}`, { email });
}
