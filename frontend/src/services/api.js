// ✅ Safe base url (no undefined)
const RAW_BASE = import.meta.env.VITE_API_URL || "";
const BASE = RAW_BASE.replace(/\/+$/, ""); // remove ending /

function makeUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;

  // If env missing, fallback to backend you already know
  const base = BASE || "https://mohsin-pil4.onrender.com";

  return `${base}${p}`;
}

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function request(method, path, body) {
  const url = makeUrl(path);

  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body || {});
  }

  const res = await fetch(url, options);
  const data = await parseJson(res);

  if (!res.ok) {
    throw new Error(data?.message || `${method} ${path} failed`);
  }

  return data;
}

export function apiGet(path) {
  return request("GET", path);
}

export function apiPost(path, body) {
  return request("POST", path, body);
}

export function apiPatch(path, body) {
  return request("PATCH", path, body);
}

export function apiDelete(path, body) {
  return request("DELETE", path, body);
}
