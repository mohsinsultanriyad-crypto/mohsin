import { useEffect, useState } from "react";
import { api } from "../services/api";
import JobCard from "../components/JobCard";
import Sheet from "../components/Sheet";
import { roles as allRoles } from "../utils/roles";
import {
  enableNotifications,
  getSavedFcmToken,
  getSavedRoles,
  setSavedRoles,
  getNewsEnabled,
  setNewsEnabled
} from "../services/fcm";

export default function Alerts({ onBadgeReset }) {
  const [selectedRoles, setSelectedRoles] = useState(getSavedRoles());
  const [newsEnabled, setNewsEnabledState] = useState(getNewsEnabled());
  const [token, setToken] = useState(getSavedFcmToken());
  const [jobs, setJobs] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  async function loadJobs(tk) {
    if (!tk) return setJobs([]);
    const data = await api.alertJobs(tk);
    setJobs(data || []);
  }

  useEffect(() => {
    // reset badge when Alerts opened
    const tk = getSavedFcmToken();
    if (tk) api.resetBadge(tk).catch(() => {});
    if (onBadgeReset) onBadgeReset();
    loadJobs(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleRole(r) {
    const set = new Set(selectedRoles);
    if (set.has(r)) set.delete(r);
    else set.add(r);
    const arr = Array.from(set);
    setSelectedRoles(arr);
    setSavedRoles(arr);
  }

  async function onEnable() {
    try {
      const tk = await enableNotifications({ roles: selectedRoles, newsEnabled });
      setToken(tk);
      await loadJobs(tk);
      alert("Notifications Enabled ✅");
    } catch (e) {
      alert(e.message || "Enable failed");
    }
  }

  async function savePrefs() {
    try {
      const tk = getSavedFcmToken();
      if (!tk) return alert("Enable notifications first");

      setSavedRoles(selectedRoles);
      setNewsEnabled(newsEnabled);
      await api.register({ token: tk, roles: selectedRoles, newsEnabled });
      await loadJobs(tk);
      alert("Saved ✅");
    } catch {
      alert("Save failed");
    }
  }

  const openJob = (job) => {
    setSelectedJob(job);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 text-xl font-bold text-blue-700">Alerts</div>

      <div className="mb-4 rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-semibold text-gray-700">Select Roles</div>
        <div className="flex flex-wrap gap-2">
          {allRoles.map((r) => {
            const active = selectedRoles.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                className={`rounded-full px-3 py-2 text-xs ${active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newsEnabled}
              onChange={(e) => {
                setNewsEnabledState(e.target.checked);
                setNewsEnabled(e.target.checked);
              }}
            />
            News Notifications
          </label>

          <div className="text-xs text-gray-500">{token ? "Enabled" : "Not enabled"}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onEnable} className="rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white">
            Enable
          </button>
          <button onClick={savePrefs} className="rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white">
            Save Roles
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
            No matching jobs yet. Select roles and enable notifications.
          </div>
        ) : (
          jobs.map((j) => <JobCard key={j._id} job={j} onClick={() => openJob(j)} />)
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={selectedJob ? selectedJob.jobRole : "Job"}>
        {selectedJob && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">{selectedJob.description}</div>
            <button
              onClick={() => {
                const msg = encodeURIComponent(`Hi, I want to apply for ${selectedJob.jobRole} in ${selectedJob.city}.`);
                const phone = (selectedJob.phone || "").replace(/\s+/g, "");
                window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
              }}
              className="w-full rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white"
            >
              Apply on WhatsApp
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
