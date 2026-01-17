import { useEffect, useMemo, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import useJobAlerts from "../hooks/useJobAlerts.js";
import { enableNotifications, listenForegroundNotifications } from "../firebase/firebaseClient.js";
import { registerPushToken, getMeta } from "../services/api.js";

export default function Alerts() {
  const [rolesAll, setRolesAll] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sj_alert_roles") || "[]"); }
    catch { return []; }
  });

  const [newsEnabled, setNewsEnabled] = useState(() => localStorage.getItem("sj_news_enabled") === "1");
  const [alertList, setAlertList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sj_alert_list") || "[]"); }
    catch { return []; }
  });

  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const alerts = useMemo(() => alertList || [], [alertList]);

  useEffect(() => {
    localStorage.setItem("sj_alert_roles", JSON.stringify(selectedRoles));
  }, [selectedRoles]);

  useEffect(() => {
    localStorage.setItem("sj_alert_list", JSON.stringify(alertList));
  }, [alertList]);

  useEffect(() => {
    localStorage.setItem("sj_news_enabled", newsEnabled ? "1" : "0");
  }, [newsEnabled]);

  useEffect(() => {
    (async () => {
      const m = await getMeta();
      setRolesAll(m.roles || []);
    })();
  }, []);

  // Poll for matching jobs and add to in-app alert list
  useJobAlerts({ enabled: true, roles: selectedRoles, setAlertList });

  function toggleRole(role) {
    setSelectedRoles((cur) => cur.includes(role) ? cur.filter(x => x !== role) : [...cur, role]);
  }

  function clearAlerts() {
    if (!confirm("Clear all alerts?")) return;
    setAlertList([]);
  }

  function markSeen(jobId) {
    setAlertList((prev) => (prev || []).map(a => a.jobId === jobId ? { ...a, seen: true } : a));
  }

  function openJob(job) {
    if (job?._id) markSeen(job._id);
    setSelectedJob(job);
    setDetailsOpen(true);
  }

  async function enablePush() {
    try {
      const vapid = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapid) return alert("VITE_FIREBASE_VAPID_KEY missing in frontend env");

      const token = await enableNotifications(vapid);
      listenForegroundNotifications();

      const resp = await registerPushToken({
        token,
        roles: selectedRoles,
        newsEnabled
      });

      if (!resp?.ok) return alert("Token register failed");
      alert("Notifications enabled");
    } catch (e) {
      alert(e?.message || "Enable failed");
    }
  }

  const unseenCount = alerts.filter(a => !a.seen).length;

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-extrabold">Alerts</div>
          <div className="text-gray-500 font-semibold mt-1">
            Unseen: {unseenCount}
          </div>
        </div>

        <button
          onClick={clearAlerts}
          className="h-11 px-4 rounded-2xl bg-gray-50 border font-extrabold text-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="mt-5 bg-gray-50 border rounded-2xl p-4">
        <div className="text-xs font-extrabold text-gray-300 tracking-widest">
          NOTIFICATIONS
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={enablePush}
            className="flex-1 h-11 rounded-2xl bg-black text-white font-extrabold"
          >
            Enable
          </button>

          <label className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white border font-extrabold text-gray-700">
            <input type="checkbox" checked={newsEnabled} onChange={(e)=>setNewsEnabled(e.target.checked)} />
            News
          </label>
        </div>

        <div className="mt-4 text-xs font-extrabold text-gray-300 tracking-widest">
          ROLES (MULTI SELECT)
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {rolesAll.map((r) => {
            const active = selectedRoles.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                className={[
                  "px-3 py-2 rounded-full border text-sm font-extrabold",
                  active ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600"
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {alerts.length === 0 && (
          <div className="text-gray-400 font-extrabold">
            No alerts yet.
          </div>
        )}

        {alerts.map((a) => (
          <JobCard key={a.id} job={a.jobSnapshot} onOpen={openJob} />
        ))}
      </div>

      <DetailsModal open={detailsOpen} job={selectedJob} onClose={() => setDetailsOpen(false)} />
    </div>
  );
}
