import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { isJobSaved, toggleSaveJob } from "../lib/storage.js";

export default function JobCard({ job, onOpen }) {
  const urgentActive = !!job.urgentActive;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isJobSaved(job._id));
  }, [job?._id]);

  function handleSave(e) {
    e.stopPropagation();
    toggleSaveJob(job._id);
    setSaved(isJobSaved(job._id));
  }

  async function handleShare(e) {
    e.stopPropagation();

    const phoneDigits = String(job.phone || "").replace(/\D/g, "");
    const wa = phoneDigits ? `https://wa.me/${phoneDigits}` : "";
    const text = `${job.jobRole} • ${job.city}\n\n${job.description || ""}\n\nApply: ${wa}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Saudi Job",
          text
        });
      } else {
        await navigator.clipboard?.writeText(text);
        alert("Copied. Share it anywhere.");
      }
    } catch {
      // user cancelled share
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="w-full text-left"
      onClick={onOpen}
      type="button"
    >
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">{job.jobRole}</div>
            <div className="mt-1 text-sm text-gray-600">{job.city}</div>
          </div>

          <div className="flex items-center gap-2">
            {urgentActive ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
                Urgent
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 line-clamp-2 text-sm text-gray-700">{job.description}</div>
        <div className="mt-3 text-xs text-gray-500">Views: {job.views || 0}</div>

        {/* ✅ Save + Share buttons */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className={[
              "flex-1 rounded-2xl px-4 py-2 text-xs font-semibold ring-1 ring-black/5",
              saved ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"
            ].join(" ")}
          >
            {saved ? "Saved" : "Save"}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex-1 rounded-2xl bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 ring-1 ring-black/5"
          >
            Share
          </button>
        </div>
      </div>
    </motion.button>
  );
}
