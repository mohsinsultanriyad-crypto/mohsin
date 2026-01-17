import { useEffect, useMemo, useState } from "react";
import { initMessagingAndGetToken } from "../firebase.js";
import { registerPush } from "../services/api.js";
import FooterLinks from "../components/FooterLinks.jsx";

const ROLES = [
  "Helper","Driver","Painter","Plumber","Electrician","Welder","Pipe Fitter","Pipe Fabricator","Scaffolder","Rigger","Safety Officer","QC Inspector","Supervisor","Carpenter","Mason"
];

export default function Alerts({ go }) {
  const [selectedRoles, setSelectedRoles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sj_alert_roles") || "[]"); } catch { return []; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("sj_fcm_token") || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem("sj_alert_roles", JSON.stringify(selectedRoles));
  }, [selectedRoles]);

  async function enableNotifications() {
    try {
      setBusy(true);
      const t = await initMessagingAndGetToken();
      if (!t) {
        alert("Notification permission not granted or unsupported.");
        return;
      }
      localStorage.setItem("sj_fcm_token", t);
      setToken(t);

      await registerPush({ token: t, roles: selectedRoles, newsEnabled: false });
      alert("Notifications enabled.");
    } catch {
      alert("Failed to enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleRole(role) {
    const next = selectedRoles.includes(role)
      ? selectedRoles.filter((x) => x !== role)
      : [...selectedRoles, role];

    setSelectedRoles(next);

    const t = token || localStorage.getItem("sj_fcm_token");
    if (!t) return;

    try {
      await registerPush({ token: t, roles: next, newsEnabled: false });
    } catch {
      // ignore
    }
  }

  const rolesUI = useMemo(() => ROLES, []);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>Alerts</div>
      <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 700 }}>
        Select roles to receive new job notifications.
      </div>

      <button
        onClick={enableNotifications}
        disabled={busy}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          marginTop: 14,
          border: "none",
          background: "#16a34a",
          color: "#fff",
          fontWeight: 900,
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Enabling..." : "Enable Notifications"}
      </button>

      <div style={{ marginTop: 14, padding: 12, border: "1px solid #e5e7eb", borderRadius: 14, background: "#fff" }}>
        <div style={{ fontWeight: 900, color: "#111827" }}>Roles (multi-select)</div>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {rolesUI.map((r) => {
            const active = selectedRoles.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                style={{
                  borderRadius: 999,
                  padding: "10px 12px",
                  border: "1px solid " + (active ? "#16a34a" : "#e5e7eb"),
                  background: active ? "#16a34a" : "#fff",
                  color: active ? "#fff" : "#374151",
                  fontWeight: 900,
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 10, color: "#6b7280", fontWeight: 700 }}>
        Note: Web push works best on Chrome Android / Desktop. Keep the app installed / allowed.
      </div>

      <FooterLinks go={go} />
    </div>
  );
}
