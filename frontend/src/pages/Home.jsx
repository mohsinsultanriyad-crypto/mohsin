import { useEffect, useState } from "react";
import { getJobs } from "../services/api.js";
import JobCard from "../components/JobCard.jsx";
import FooterLinks from "../components/FooterLinks.jsx";

export default function Home({ go }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openJob, setOpenJob] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const data = await getJobs();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>All Jobs</div>
      <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 700 }}>
        Clean feed • No filters • Jobs expire in 15 days
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={load}
          style={{
            height: 42,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontWeight: 900,
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        {loading && <div style={{ color: "#6b7280", fontWeight: 800 }}>Loading…</div>}
        {!loading && items.length === 0 && (
          <div style={{ color: "#6b7280", fontWeight: 800 }}>No jobs yet.</div>
        )}
        {items.map((j) => (
          <JobCard key={j._id} job={j} onOpen={(job) => setOpenJob(job)} />
        ))}
      </div>

      {openJob && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
          onClick={() => setOpenJob(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 14, padding: 14 }}
          >
            <div style={{ fontSize: 18, fontWeight: 900 }}>{openJob.jobRole}</div>
            <div style={{ marginTop: 6, fontWeight: 800, color: "#374151" }}>
              {openJob.city} {openJob.companyName ? `• ${openJob.companyName}` : ""}
            </div>
            <div style={{ marginTop: 8, color: "#111827", fontWeight: 700, whiteSpace: "pre-wrap" }}>
              {openJob.description}
            </div>
            <div style={{ marginTop: 10, color: "#6b7280", fontWeight: 700 }}>
              Phone: {openJob.phone}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <a
                href={`https://wa.me/${String(openJob.phone || "").replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  textAlign: "center",
                  textDecoration: "none",
                  height: 44,
                  lineHeight: "44px",
                  borderRadius: 12,
                  background: "#16a34a",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                WhatsApp Apply
              </a>
              <button
                onClick={() => setOpenJob(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontWeight: 900,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <FooterLinks go={go} />
    </div>
  );
}
