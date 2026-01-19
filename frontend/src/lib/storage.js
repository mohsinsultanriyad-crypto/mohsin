const K = {
  badge: "sj_badge",
  roles: "sj_roles",
  newsEnabled: "sj_news_enabled",
  token: "sj_fcm_token",
  myEmail: "sj_my_email",
  savedJobs: "sj_saved_jobs",
};

export function getBadge() {
  const n = Number(localStorage.getItem(K.badge) || "0");
  return Number.isFinite(n) ? n : 0;
}

export function bumpBadge(delta = 1) {
  const next = getBadge() + delta;
  localStorage.setItem(K.badge, String(Math.max(0, next)));
}

export function resetBadge() {
  localStorage.setItem(K.badge, "0");
}

export function getRoles() {
  try {
    const raw = localStorage.getItem(K.roles);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setRoles(roles) {
  localStorage.setItem(K.roles, JSON.stringify(roles || []));
}

export function getNewsEnabled() {
  return localStorage.getItem(K.newsEnabled) !== "0";
}

export function setNewsEnabled(v) {
  localStorage.setItem(K.newsEnabled, v ? "1" : "0");
}

export function getSavedToken() {
  return localStorage.getItem(K.token) || "";
}

export function setSavedToken(t) {
  localStorage.setItem(K.token, t || "");
}

export function getMyEmail() {
  return localStorage.getItem(K.myEmail) || "";
}

export function setMyEmail(email) {
  localStorage.setItem(K.myEmail, email || "");
}
export function getSavedJobs() {
  try {
    const raw = localStorage.getItem(K.savedJobs);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getSavedJobs() {
  try {
    const raw = localStorage.getItem(K.savedJobs);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function isJobSaved(id) {
  return getSavedJobs().includes(String(id));
}

export function toggleSavedJob(id) {
  const key = String(id);
  const list = getSavedJobs();
  const next = list.includes(key) ? list.filter((x) => x !== key) : [key, ...list];
  localStorage.setItem(K.savedJobs, JSON.stringify(next));
  return next;
}