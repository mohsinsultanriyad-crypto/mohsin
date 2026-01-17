import { useEffect, useState } from "react";
import { getJobs, deleteJob, registerPush, getNews } from "../services/api.js";
import FooterLinks from "../components/FooterLinks.jsx";

export default function Dashboard({ go }) {
  const [email, setEmail] = useState(() => localStorage.getItem("sj_dash_email") || "");
  const [verified, setVerified] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [newsEnabled, setNewsEnabled] = useState(() => localStorage.getItem("sj_news_enabled") === "1");
  const [news, setNews] = useState([]);

  useEffect(() => {
    // load cached news (placeholder now)
    (async () => {
      const data = await getNews();
      setNews(data.items || []);
    })();
  }, []);

  async function verifyEmail() {
    const e = String(email || "").trim().toLowerCase();
    if (!e) return alert("Enter email.");
    localStorage.setItem("sj_dash_email", e);
    setEmail(e);
    setVerified(true);
    await loadMyJobs(e);
  }

  async function loadMyJobs(e = email) {
    const data = await getJobs();
    const clean = String(e || "").trim().toLowerCase();
    setMyJobs((data.items || []).filter((j) => String(j.email || "").toLowerCase() === clean));
  }

  async function handleDelete(id) {
    try {
      await deleteJob(id, email);
      setMyJobs((prev) => prev.filter((j) => j._id !== id));
      alert("Deleted.");
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    }
  }

  async function toggleNewsAlerts() {
    const next = !newsEnabled;
    setNewsEnabled(next);
    localStorage.setItem("sj_news_enabled", next ? "1" : "0");

    const token = localStorage.getItem("sj_fcm_token");
    if (!token) {
      alert("Enable notifications first (Alerts tab).");
      return;
    }

    try {
      // keep roles unchanged, only update newsEnabled
      const roles = JSON.parse(localStorage.getItem("sj_alert_roles") || "[]");
      await registerPush({ token, roles, newsEnabled: next });
      alert(next ? "News alerts enabled." : "News alerts disabled.");
    } catch {
      alert("Failed to update news alerts.");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>Dashboard</div>

      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 900 }}>Saudi Labour Updates</div>
            <div style={{ color: "#6b7280", fontWeight: 700, marginTop: 4 }}>
              Auto news feed (backend endpoint can be added next)
            </div>
          </div>
          <button
            onClick={toggleNewsAlerts}
            style={{
              height: 42,
              padding: "0 12px",
              borderRadius: 12,
              border: "1px solid " + (newsEnabled ? "#16a34a" : "#e5e7eb"),
              background: newsEnabled ? "#16a34a" : "#fff",
              color: newsEnabled ? "#fff" : "#111827",
              fontWeight: 900,
            }}
          >
            {newsEnabled ? "Alerts ON" : "Alerts OFF"}
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          {news.length === 0 ? (
            <div style={{ color: "#6b7280", fontWeight: 800 }}>
              No news loaded yet. (When backend /api/news is added, it will show here.)
            </div>
          ) : (
            news.map((n) => (
              <div key={n.link} style={{ padding: "10px 0", borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontWeight: 900 }}>{n.title}</div>
                <div style={{ color: "#6b7280", fontWeight: 700, marginTop: 4 }}>
                  {n.source} • {new Date(n.publishedAt).toLocaleDateString()}
                </div>
                <a href={n.link} target="_blank" rel="noreferrer" style={{ fontWeight: 900, color: "#2563eb" }}>
                  Read more
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, background: "#fff" }}>
        <div style={{ fontWeight: 900 }}>My Posted Jobs</div>
        <div style={{ color: "#6b7280", fontWeight: 700, marginTop: 4 }}>
          Verify email to manage your jobs.
        </div>

        {!verified ? (
          <div style={{ marginTop: 10 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: "0 12px",
                fontWeight: 800,
              }}
            />
            <button
              onClick={verifyEmail}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                marginTop: 10,
                border: "none",
                background: "#111827",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              Verify & Show My Jobs
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => loadMyJobs(email)}
              style={{
                height: 42,
                padding: "0 12px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontWeight: 900,
              }}
            >
              Refresh
            </button>

            <div style={{ marginTop: 10 }}>
              {myJobs.length === 0 ? (
                <div style={{ color: "#6b7280", fontWeight: 800 }}>No jobs found for this email.</div>
              ) : (
                myJobs.map((j) => (
                  <div key={j._id} style={{ borderTop: "1px solid #f3f4f6", padding: "10px 0" }}>
                    <div style={{ fontWeight: 900 }}>{j.jobRole}</div>
                    <div style={{ color: "#6b7280", fontWeight: 700, marginTop: 4 }}>
                      {j.city} • {j.companyName || ""}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                      <button
                        onClick={() => handleDelete(j._id)}
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 12,
                          border: "none",
                          background: "#b91c1c",
                          color: "#fff",
                          fontWeight: 900,
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => alert("Edit feature can be added next in backend (PUT /api/jobs/:id).")}
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          fontWeight: 900,
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <FooterLinks go={go} />
    </div>
  );
}
