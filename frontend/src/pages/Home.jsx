import { useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import JobCard from "../components/JobCard.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import { fetchJobs, viewJob } from "../services/jobsApi.js";

import { getSavedJobs, toggleSavedJob } from "../lib/storage.js";
import { toSaudiMsisdn } from "../lib/phone.js";   // ✅ NEW

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // Saved Jobs state
  const [savedIds, setSavedIds] = useState(() => getSavedJobs());

  const activeSaved = useMemo(() => {
    if (!active?._id) return false;
    return savedIds.includes(String(active._id));
  }, [active, savedIds]);

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

  async function openJob(job) {
    setActive(job);
    setOpen(true);
    try {
      await viewJob(job._id);
      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id ? { ...j, views: (j.views || 0) + 1 } : j
        )
      );
    } catch {}
  }

  function handleToggleSave() {
    if (!active?._id) return;
    const next = toggleSavedJob(active._id);
    setSavedIds(next);
  }

  async function handleShare() {
    if (!active) return;

    const msisdn = toSaudiMsisdn(active.phone);

    const wa =
      msisdn && msisdn.length >= 10
        ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
            `Hello, I want to apply for ${active.jobRole} in ${active.city}.`
          )}`
        : "";

    const text =
      `SAUDI JOB\n` +
      `${active.jobRole} • ${active.city}\n\n` +
      `${active.description || ""}\n\n` +
      (wa ? `Apply WhatsApp: ${wa}\n` : "");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Job: ${active.jobRole}`,
          text
        });
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      alert(text);
    }
  }

  // ✅ WhatsApp number normalized
  const msisdn = active ? toSaudiMsisdn(active.phone) : "";
  const waOk = msisdn && msisdn.length >= 10;

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">All Jobs</div>
        <div className="mt-1 text-sm text-gray-500">Latest active jobs</div>
      </div>

      {loading ? <Loading /> : null}
      {!loading && jobs.length === 0 ? (
        <Empty title="No jobs yet" desc="New jobs will appear here." />
      ) : null}

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
        ))}
      </div>

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={active ? `${active.jobRole} • ${active.city}` : "Job"}
      >
        {active ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {active.description}
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <div className="text-xs text-gray-500">Posted by</div>
              <div className="mt-1 text-sm font-semibold text-gray-800">
                {active.companyName ? active.companyName : active.name}
              </div>
              <div className="mt-1 text-sm text-gray-600">{active.phone}</div>
            </div>

            {/* Save + Share */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ring-black/5",
                  activeSaved
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-800"
                ].join(" ")}
              >
                {activeSaved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Share
              </button>
            </div>

            {/* WhatsApp Apply */}
            <a
              className={`block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white ${
                waOk ? "bg-green-600" : "bg-gray-400 pointer-events-none"
              }`}
              href={
                waOk
                  ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
                      `Hello, I want to apply for ${active.jobRole} in ${active.city}.`
                    )}`
                  : "#"
              }
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
