import { motion } from "framer-motion";

export default function JobCard({ job, onOpen }) {
  const urgentActive = !!job.urgentActive;
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
          {urgentActive ? (
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
              Urgent
            </span>
          ) : null}
        </div>
        <div className="mt-3 line-clamp-2 text-sm text-gray-700">{job.description}</div>
        <div className="mt-3 text-xs text-gray-500">Views: {job.views || 0}</div>
      </div>
    </motion.button>
  );
}
