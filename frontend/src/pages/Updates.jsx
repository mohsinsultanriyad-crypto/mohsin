import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";

import { fetchJobs, viewJob } from "../services/jobsApi.js";
import { getSavedJobs, toggleSavedJob } from "../lib/storage.js";

export default function Updates() {
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(() => {
    const ids = getSavedJobs();
    return Array.isArray(ids) ? ids.map(String) : [];
  });

  const [savedJobs, setSavedJobs] = useState([]);

  const [open, setOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  const activeSaved = useMemo(() => {
    if (!activeJob?._id) return false;
    return savedIds.includes(String(activeJob._id));
  }, [activeJob, savedIds]);

  async function load() {
    setLoading(true);
    try {
      const ids = getSavedJobs();
      const normalized = Array.isArray(ids) ? ids.map(String) : [];
      setSavedIds(normalized);

      if (normalized.length > 0) {
        const allJobs = await fetchJobs();
        const saved = allJobs.filter((j) => normalized.includes(String(j._id)));
        setSavedJobs(saved);
      } else {
        setSavedJobs([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ if user saves/unsaves in other tab, updates page also updates
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sj_saved_jobs") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function openJob(job) {
    setActiveJob(job);
    setOpen(true);
    try {
      await viewJob(job._id);
    } catch {}
  }

  function handleToggleSave() {
    if (!activeJob?._id) return;
    const next = toggleSavedJob(activeJob._id);
    setSavedIds(next);

    // UI instantly update list without refresh
    if (next.includes(String(activeJob._id))) {
      // add if not exists
      setSavedJobs((prev) => {
        const exists = prev.some((j) => String(j._id) === String(activeJob._id));
        return exists ? prev : [activeJob, ...prev];
      });
    } else {
      // remove
      setSavedJobs((prev) => prev.filter((j) => String(j._id) !== String(activeJob._id)));
      setOpen(false); // optional: close modal after unsave
    }
  }

  async function handleShare() {
    if (!activeJob) return;

    const phone = String(activeJob.phone || "").replace(/\D/g, "");
    const wa = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(
          `Hello, I want to apply for ${activeJob.jobRole} in ${activeJob.city}.`
        )}`
      : "";

    const text =
      `SAUDI JOB\n` +
      `${activeJob.jobRole} • ${activeJob.city}\n\n` +
      `${activeJob.description || ""}\n\n` +
      (wa ? `Apply WhatsApp: ${wa}\n` : "");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Job: ${activeJob.jobRole} • ${activeJob.city}`,
          text
        });
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied");
    } catch {
      alert(text);
    }
  }

  // If opened from notification → /updates?jobId=xxxx
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(loc.search);
    const jobId = params.get("jobId");

    if (jobId) {
      const found = savedJobs.find((j) => String(j._id) === String(jobId));
      if (found) openJob(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loc.search]);

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Updates</div>
        <div className="mt-1 text-sm text-gray-500">Saved Jobs</div>
      </div>

      {loading && <Loading />}

      {!loading && savedJobs.length === 0 && (
        <Empty
          title="No saved jobs"
          desc="Home tab par kisi job ko Save karo, wo yahan dikhega."
        />
      )}

      {!loading && savedJobs.length > 0 && (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
          ))}
        </div>
      )}

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={activeJob ? `${activeJob.jobRole} • ${activeJob.city}` : "Details"}
      >
        {activeJob && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {activeJob.description}
            </div>

            {/* ✅ Save + Share row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                className={[
                  "w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold ring-1 ring-black/5",
                  activeSaved ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-800"
                ].join(" ")}
              >
                {activeSaved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Share
              </button>
            </div>

            {/* ✅ WhatsApp */}
            <a
              className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={`https://wa.me/${String(activeJob.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello, I want to apply for ${activeJob.jobRole} in ${activeJob.city}.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Apply on WhatsApp
            </a>
          </div>
        )}
      </ModalSheet>

      {/* ✅ Only Updates tab footer links */}
      <div className="mt-10 border-t border-gray-200 pt-4 pb-6 text-center">
        <div className="flex items-center justify-center gap-4 text-sm font-semibold">
          <Link className="text-gray-700 hover:text-blue-700" to="/privacy">
            Privacy Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link className="text-gray-700 hover:text-blue-700" to="/terms">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
