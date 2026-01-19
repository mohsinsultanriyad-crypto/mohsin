import { motion } from "framer-motion";
import { isJobSaved, toggleSavedJob } from "../lib/storage.js";

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    const dd = String(dt.getDate()).padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const mon = months[dt.getMonth()];
    const yyyy = dt.getFullYear();
    return `${dd}-${mon}-${yyyy}`;
  } catch {
    return "";
  }
}

function isNew(createdAt, hours = 24) {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  const diff = Date.now() - t;
  return diff >= 0 && diff <= hours * 60 * 60 * 1000;
}

export default function JobCard({ job, onOpen, onSavedChange }) {
  const urgentActive = !!job.urgentActive;

  const createdAt = job.createdAt || job.created_at || job.created; // ✅ fallback
  const showNew = createdAt ? isNew(createdAt, 24) : false;
  const dateText = createdAt ? formatDate(createdAt) : "";

  const saved = isJobSaved(job._id);

  function handleSave(e) {
    e.stopPropagation();
    toggleSavedJob(job._id);
    onSavedChange?.();
  }

  async function handleShare(e) {
    e.stopPropagation();

    const cleanPhone = String(job.phone || "").replace(/\D/g, "");
    const text =
      `SAUDI JOB\n` +
      `${job.jobRole} • ${job.city}${dateText ? ` • ${dateText}` : ""}\n\n` +
      `${job.description || ""}\n\n` +
      (cleanPhone ? `Apply WhatsApp: https://wa.me/${cleanPhone}` : "");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Job: ${job.jobRole}`,
          text
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied! Paste in WhatsApp.");
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="w-full"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.();
      }}
    >
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">{job.jobRole}</div>
            <div className="mt-1 text-sm text-gray-600">{job.city}</div>

            {/* ✅ Date line */}
            {dateText ? <div className="mt-1 text-xs text-gray-500">{dateText}</div> : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* ✅ NEW badge (24h) */}
            {showNew ? (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                New
              </span>
            ) : null}

            {/* ✅ Urgent badge */}
            {urgentActive ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
                Urgent
              </span>
            ) : null}

            {/* ✅ Save */}
            <button
              type="button"
              onClick={handleSave}
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5",
                saved ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
              ].join(" ")}
            >
              {saved ? "Saved" : "Save"}
            </button>

            {/* ✅ Share */}
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white"
            >
              Share
            </button>
          </div>
        </div>

        <div className="mt-3 line-clamp-2 text-sm text-gray-700">{job.description}</div>
        <div className="mt-3 text-xs text-gray-500">Views: {job.views || 0}</div>
      </div>
    </motion.div>
  );
}