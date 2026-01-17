import { useEffect, useState } from "react";
import { apiGetNews } from "../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiGetNews();
        if (!alive) return;
        setNews(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "News load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
        Dashboard
      </h2>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Saudi Labour News
        </div>

        {loading && <div>Loading news...</div>}
        {!loading && err && (
          <div style={{ color: "crimson" }}>Error: {err}</div>
        )}

        {!loading && !err && news.length === 0 && (
          <div>No news right now.</div>
        )}

        {!loading && !err && news.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {news.map((n) => (
              <a
                key={n._id || n.link}
                href={n.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>
                  {n.title}
                </div>
                {n.summary && (
                  <div style={{ opacity: 0.8, fontSize: 13 }}>{n.summary}</div>
                )}
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                  {n.source || ""}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
