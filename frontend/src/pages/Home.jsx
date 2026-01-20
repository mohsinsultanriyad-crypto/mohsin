import { useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import JobCard from "../components/JobCard.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import { fetchJobs, viewJob } from "../services/jobsApi.js";

import { getSavedJobs, toggleSavedJob } from "../lib/storage.js";
import { AnimatePresence, motion } from "framer-motion";

function isTodayLocal(dateStr) {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function CityBanner({ items }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    setIdx(0);
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % items.length);
    }, 2500);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[idx];

  return (
    <div className="mb-3">
      <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
        <div className="text-xs font-semibold text-blue-700">Today’s job activity</div>

        <div className="mt-1 h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.city}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-semibold text-gray-900"
            >
              {current.city}: {current.count} jobs
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  // saved ids in state so UI updates instantly (no refresh)
  const [savedIds, setSavedIds] = useState(() => getSavedJobs().map(String));

  const activeSaved = useMemo(() => {
    if (!active?._id) return false;
    return savedIds.includes(String(active._id));
  }, [active, savedIds]);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchJobs();
      setJobs(list || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Banner data (today city-wise counts)
  const bannerItems = useMemo(() => {
    const map = new Map();

    for (const j of jobs) {
      const createdAt = j.createdAt || j.created_at || j.created;
      if (!createdAt) continue;

      if (!isTodayLocal(createdAt)) continue;

      const city = (j.city || "Unknown").trim();
      map.set(city, (map.get(city) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // top cities only (banner clean rahe)
  }, [jobs]);

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

  function handleToggleSave() {
    if (!active?._id) return;
    const next = toggleSavedJob(active._id).map(String);
    setSavedIds(next);
  }

  async function handleShare() {
    if (!active) return;

    const phone = String(active.phone || "").replace(/\D/g, "");
    const wa = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(
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
          title: `Job: ${active.jobRole} • ${active.city}`,
          text
        });
        return;
      }
    } catch {
      // ignore share cancel
    }

    // fallback: copy
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      alert(text);
    }
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">All Jobs</div>
        <div className="mt-1 text-sm text-gray-500">Latest active jobs</div>
      </div>

      {/* ✅ Sliding banner */}
      {!loading ? <CityBanner items={bannerItems} /> : null}

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
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{active.description}</div>

            <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <div className="text-xs text-gray-500">Posted by</div>
              <div className="mt-1 text-sm font-semibold text-gray-800">
                {active.companyName ? active.companyName : active.name}
              </div>
              <div className="mt-1 text-sm text-gray-600">{active.phone}</div>
            </div>

            {/* Save + Share row */}
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

            {/* WhatsApp */}
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
