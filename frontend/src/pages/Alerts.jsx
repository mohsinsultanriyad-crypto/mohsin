import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import MultiSelect from "../components/MultiSelect.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";

import { getFcmToken } from "../firebase.js";
import { upsertToken } from "../services/tokensApi.js";
import { fetchJobs, viewJob } from "../services/jobsApi.js";

import { getRoles, setRoles, getSavedToken, setSavedToken } from "../lib/storage.js";

const roleOptions = [
  "Helper",
  "Driver",
  "Painter",
  "Electrician",
  "Plumber",
  "Welder",
  "Pipe Fitter",
  "Scaffolder",
  "Mason",
  "Carpenter",
  "AC Technician"
];

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const [roles, setRolesState] = useState(getRoles());
  const [token, setToken] = useState(getSavedToken());
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const matching = useMemo(() => {
    if (!roles.length) return [];
    return jobs.filter((j) => roles.includes(j.jobRole));
  }, [jobs, roles]);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchJobs();
      setJobs(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setRoles(roles);
  }, [roles]);

  async function enableNotifications() {
    setSaving(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission not granted.");
        return;
      }

      const t = await getFcmToken();
      if (!t.ok) {
        alert(`FCM token error: ${t.reason}`);
        return;
      }

      await upsertToken({
        token: t.token,
        roles
      });

      setToken(t.token);
      setSavedToken(t.token);

      alert("Notifications enabled.");
    } catch (e) {
      alert(e?.message || "Failed to enable notifications");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    if (!token) {
      alert("Enable notifications first.");
      return;
    }
    setSaving(true);
    try {
      await upsertToken({ token, roles });
      alert("Saved.");
    } catch (e) {
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function openJob(job) {
    setActive(job);
    setOpen(true);
    try {
      await viewJob(job._id);
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, views: (j.views || 0) + 1 } : j))
      );
    } catch {}
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Alerts</div>
        <div className="mt-1 text-sm text-gray-500">Role-based job alerts</div>
      </div>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-900">Select Roles</div>
          <div className="mt-3">
            <MultiSelect options={roleOptions} value={roles} onChange={setRolesState} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <button
              type="button"
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              onClick={enableNotifications}
              disabled={saving}
            >
              {saving ? "Working..." : "Enable Notifications"}
            </button>

            <button
              type="button"
              className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              onClick={savePreferences}
              disabled={saving}
            >
              Save Preferences
            </button>

            <div className="text-xs text-gray-500">Token: {token ? "Saved" : "Not enabled"}</div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Matching Jobs</div>
          <button
            className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            onClick={load}
            type="button"
          >
            Refresh
          </button>
        </div>

        {loading ? <Loading /> : null}
        {!loading && roles.length === 0 ? (
          <Empty title="Select roles to see matching jobs" desc="Choose one or more roles above." />
        ) : null}
        {!loading && roles.length > 0 && matching.length === 0 ? (
          <Empty title="No matching jobs" desc="You will get notified when a job matches." />
        ) : null}

        <div className="space-y-3">
          {matching.map((job) => (
            <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
          ))}
        </div>
      </div>

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={active ? `${active.jobRole} • ${active.city}` : "Job"}
      >
        {active ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{active.description}</div>

            <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <div className="text-xs text-gray-500">Posted by</div>
              <div className="mt-1 text-sm font-semibold text-gray-800">
                {active.companyName ? active.companyName : active.name}
              </div>
              <div className="mt-1 text-sm text-gray-600">{active.phone}</div>
            </div>

            <a
              className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={`https://wa.me/${String(active.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello, I want to apply for ${active.jobRole} in ${active.city}.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Apply on WhatsApp
            </a>
          </div>
        ) : null}
      </ModalSheet>
    </div>
  );
}