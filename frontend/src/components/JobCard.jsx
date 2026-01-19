import { motion } from "framer-motion";

function shortDate(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[dt.getMonth()]} ${dt.getDate()}`;
  } catch {
    return "";
  }
}

export default function JobCard({ job, onOpen }) {
  const createdAt = job.createdAt || job.created_at || job.created;
  const dateText = createdAt ? shortDate(createdAt) : "";

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

          {dateText ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
              <span>📅</span>
              {dateText}
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-green-600">📍</span>
            <span>{job.city}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">🧰</span>
            <span>Posted by: {postedBy}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <span className="text-sm font-semibold text-green-600">View Details</span>
        </div>
      </div>
    </motion.button>
  );
}