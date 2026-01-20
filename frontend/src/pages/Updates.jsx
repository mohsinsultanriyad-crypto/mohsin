import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";

import { fetchJobs, viewJob } from "../services/jobsApi.js";
import { getSavedJobs, toggleSavedJob } from "../lib/storage.js";
import { toSaudiMsisdn } from "../lib/phone.js"; // ✅ SAME FIX AS HOME

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

  // ✅ Update when saved jobs change (same tab + other tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sj_saved_jobs") load();
    };

    const onCustom = () => load();

    window.addEventListener("storage", onStorage);
    window.addEventListener("sj_saved_jobs_changed", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sj_saved_jobs_changed", onCustom);
    };
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

    // ✅ tell same-tab listeners (Updates/Home) to refresh
    window.dispatchEvent(new Event("sj_saved_jobs_changed"));

    // ✅ instant UI update
    if (next.includes(String(activeJob._id))) {
      setSavedJobs((prev) => {
        const exists = prev.some((j) => String(j._id) === String(activeJob._id));
        return exists ? prev : [activeJob, ...prev];
      });
    } else {
      setSavedJobs((prev) => prev.filter((j) => String(j._id) !== String(activeJob._id)));
      setOpen(false);
    }
  }

  async function handleShare() {
    if (!activeJob) return;

    const msisdn = toSaudiMsisdn(activeJob.phone);

    const wa =
      msisdn && msisdn.length >= 10
        ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
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

  // ✅ open from notification: /updates?jobId=xxxx
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

  const msisdn = activeJob ? toSaudiMsisdn(activeJob.phone) : "";
  const waOk = msisdn && msisdn.length >= 10;

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Updates</div>
        <div className="mt-1 text-sm text-gray-500">Saved Jobs</div>
      </div>

      {loading ? <Loading /> : null}

      {!loading && savedJobs.length === 0 ? (
        <Empty title="No saved jobs" desc="Home tab par kisi job ko Save karo, wo yahan dikhega." />
      ) : null}

      {!loading && savedJobs.length > 0 ? (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
          ))}
        </div>
      ) : null}

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={activeJob ? `${activeJob.jobRole} • ${activeJob.city}` : "Details"}
      >
        {activeJob ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{activeJob.description}</div>

            {/* ✅ Save + Share */}
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

            {/* ✅ WhatsApp (with correct Saudi number) */}
            <a
              className={`block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white ${
                waOk ? "bg-green-600" : "bg-gray-400 pointer-events-none"
              }`}
              href={
                waOk
                  ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
                      `Hello, I want to apply for ${activeJob.jobRole} in ${activeJob.city}.`
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

      {/* ✅ Footer links only on Updates page */}
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
