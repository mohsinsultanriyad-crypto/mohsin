import { useEffect, useMemo, useState } from "react";
import { getJobs, saveToken } from "../services/api";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

const ALL_ROLES = [
  "helper","driver","painter","plumber","electrician","welder",
  "pipe fitter","pipe fabricator","scaffolder","supervisor",
  "qc inspector","safety officer","mason","carpenter","rigger"
];

export default function Alerts() {
  const [roles, setRoles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alert_roles") || "[]");
    } catch {
      return [];
    }
  });
  const [newsEnabled, setNewsEnabled] = useState(() => {
    return localStorage.getItem("news_enabled") === "1";
  });

  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("push_enabled") === "1";
  });

  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState("");

  async function loadJobs() {
    try {
      const data = await getJobs();
      // backend kabhi {items} kabhi direct array ho sakta hai
      const list = Array.isArray(data) ? data : (data.items || []);
      setJobs(list);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadJobs();
    const t = setInterval(loadJobs, 15000); // 15 sec sync
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("alert_roles", JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("news_enabled", newsEnabled ? "1" : "0");
  }, [newsEnabled]);

  // Foreground push aate hi badge + refresh
  useEffect(() => {
    const unsub = onMessage(messaging, () => {
      // alerts refresh so delete sync + new jobs
      loadJobs();
      // badge count store (bottom nav me use hoga)
      const c = Number(localStorage.getItem("alert_badge") || "0") + 1;
      localStorage.setItem("alert_badge", String(c));
      window.dispatchEvent(new Event("badge_update"));
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!roles.length) return [];
    const set = new Set(roles);
    return jobs.filter(j => set.has(String(j.jobRole || "").toLowerCase()));
  }, [jobs, roles]);

  const toggleRole = (r) => {
    setRoles(prev => {
      if (prev.includes(r)) return prev.filter(x => x !== r);
      return [...prev, r];
    });
  };

  const enableNotifications = async () => {
    setErr("");
    try {
      setLoading(true);

      const vapid = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapid) {
        alert("VITE_FIREBASE_VAPID_KEY missing in frontend env");
        setLoading(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        alert("Service Worker not supported in this browser");
        setLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied");
        setLoading(false);
        return;
      }

      const token = await getToken(messaging, { vapidKey: vapid });
      if (!token) {
        alert("Token not generated. Check Firebase config / HTTPS.");
        setLoading(false);
        return;
      }

      await saveToken(token, roles.length ? roles : ALL_ROLES, newsEnabled);

      localStorage.setItem("push_enabled", "1");
      setEnabled(true);

      // badge reset when enabled
      localStorage.setItem("alert_badge", "0");
      window.dispatchEvent(new Event("badge_update"));

      alert("Notifications enabled ✅");
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Enable failed");
      alert("Enable failed. Console check karo.");
    } finally {
      setLoading(false);
    }
  };

  const clearBadge = () => {
    localStorage.setItem("alert_badge", "0");
    window.dispatchEvent(new Event("badge_update"));
  };

  return (
    <div style={{ padding: "14px" }}>
      <h2 style={{ margin: "6px 0 12px" }}>Alerts</h2>

      <div style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        marginBottom: "12px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={enableNotifications}   // ✅ IMPORTANT: brackets nahi
          disabled={loading}
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: loading ? "#eee" : "#111",
            color: loading ? "#555" : "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {enabled ? "Enabled ✅" : loading ? "Enabling..." : "Enable"}
        </button>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={newsEnabled}
            onChange={(e) => setNewsEnabled(e.target.checked)}
          />
          News
        </label>

        <button
          onClick={clearBadge}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          Mark as seen
        </button>
      </div>

      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        Roles (multi-select)
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 18
      }}>
        {ALL_ROLES.map(r => {
          const active = roles.includes(r);
          return (
            <button
              key={r}
              onClick={() => toggleRole(r)}
              style={{
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid #ddd",
                background: active ? "#16a34a" : "#fff",
                color: active ? "#fff" : "#111",
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      {err ? (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          {err}
        </div>
      ) : null}

      <div style={{ fontWeight: 800, marginBottom: 8 }}>
        Matching jobs ({filtered.length})
      </div>

      {!roles.length ? (
        <div style={{ opacity: 0.7 }}>
          Pehle roles select karo, phir yahan matching jobs aayenge.
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ opacity: 0.7 }}>
          Abhi matching jobs nahi hai (ya job delete ho chuka hai).
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(j => (
            <div key={j._id} style={{
              border: "1px solid #e5e5e5",
              borderRadius: 14,
              padding: 12,
              background: "#fff"
            }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {(j.jobRole || "").toLowerCase()}
              </div>
              <div style={{ opacity: 0.8, marginTop: 4 }}>
                {j.city}
              </div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>
                Views: {j.views ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
