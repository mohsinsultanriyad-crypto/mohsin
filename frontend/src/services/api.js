const API = import.meta.env.VITE_API_URL || "https://mohsin-wmgw.onrender.com";

// ---------------- JOBS ----------------

export async function getJobs() {
  const res = await fetch(`${API}/api/jobs`);
  return res.json();
}

export async function postJob(data) {
  const res = await fetch(`${API}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteJob(id, email) {
  const res = await fetch(`${API}/api/jobs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

// ---------------- NEWS ----------------

export async function getNews() {
  const res = await fetch(`${API}/api/news`);
  return res.json();
}

// ---------------- META (FIXED) ----------------
// PostJob.jsx uses this
export async function getMeta() {
  return {
    cities: [
      "Riyadh","Jeddah","Dammam","Khobar","Jubail","Mecca","Medina",
      "Taif","Tabuk","Hail","Abha","Jazan","Najran","Al Ahsa"
    ],
    roles: [
      "helper","driver","painter","plumber","electrician","welder",
      "pipe fitter","pipe fabricator","scaffolder","supervisor",
      "qc inspector","safety officer","mason","carpenter","rigger"
    ]
  };
}

// ---------------- PUSH ----------------

export async function saveToken(token, roles, newsEnabled) {
  await fetch(`${API}/api/push/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, roles, newsEnabled }),
  });
}
