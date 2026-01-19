import { motion } from "framer-motion";

function shortDate(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[dt.getMonth()]} ${dt.getDate()}`;
  } catch {
    return "";
  }
}

function isUrgent(job) {
  const u = job?.urgentUntil;
  if (!u) return false;
  const t = new Date(u).getTime();
  return Number.isFinite(t) && t > Date.now();
}

export default function JobCard({ job, onOpen }) {
  const createdAt = job.createdAt || job.created_at || job.created;
  const dateText = createdAt ? shortDate(createdAt) : "";

  const urgentActive = isUrgent(job);

  const postedBy = job.companyName ? job.companyName : job.name;

  return (
    <motion.button
      whileTap={{ scale: 0.99 }}
      className="w-full text-left"
      type="button"
      onClick={onOpen}
    >
      <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-lg font-extrabold text-gray-900">{job.jobRole}</div>

          <div className="flex items-center gap-2">
            {urgentActive ? (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
                Urgent
              </span>
            ) : null}

            {dateText ? (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                {dateText}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{job.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Posted by:</span>
            <span className="text-sm font-semibold text-gray-800">{postedBy}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span className="text-sm font-semibold text-blue-600">View Details</span>
        </div>
      </div>
    </motion.button>
  );
}