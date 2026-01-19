// src/pages/Updates.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";

import { fetchJobs, viewJob } from "../services/jobsApi.js";
import { getSavedJobs } from "../lib/storage.js";

export default function Updates() {
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  const [open, setOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  const savedIds = useMemo(() => {
    const ids = getSavedJobs();
    return Array.isArray(ids) ? ids.map(String) : [];
  }, []);

  async function load() {
    setLoading(true);
    try {
      // ✅ Saved jobs show as many as user saved (no limit)
      if (savedIds.length) {
        const jobs = await fetchJobs();
        const saved = jobs.filter((j) => savedIds.includes(String(j._id)));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openJob(job) {
    setActiveJob(job);
    setOpen(true);
    try {
      await viewJob(job._id);
    } catch {}
  }

  // ✅ If opened from notification: /updates?jobId=xxx
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
        <div className="mt-1 text-sm text-gray-500">Saved jobs</div>
      </div>

      {loading ? <Loading /> : null}

      {!loading && savedJobs.length === 0 ? (
        <Empty
          title="No saved jobs"
          desc="Home tab me kisi job ko Save karo, wo yahan show hoga."
        />
      ) : null}

      {!loading && savedJobs.length > 0 ? (
        <div className="space-y-3">
          {savedJobs.map((j) => (
            <JobCard key={j._id} job={j} onOpen={() => openJob(j)} />
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
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {activeJob.description}
            </div>

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
        ) : null}
      </ModalSheet>
    </div>
  );
}
```0