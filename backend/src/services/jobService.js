import { Job } from "../models/Job.js";

export function calcExpiry() {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
  return expiresAt;
}

export function calcUrgentUntil(isUrgent) {
  if (!isUrgent) return null;
  const now = new Date();
  return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
}

export async function getActiveJobs() {
  const now = new Date();
  // TTL will delete expired, but for safety filter too
  const jobs = await Job.find({ expiresAt: { $gt: now } })
    .sort({ urgentUntil: -1, createdAt: -1 })
    .lean();

  return jobs.map((j) => ({
    ...j,
    urgentActive: j.urgentUntil ? new Date(j.urgentUntil) > now : false
  }));
}
