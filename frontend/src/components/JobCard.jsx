export default function JobCard({ job, onOpen }) {
  return (
    <button
      onClick={() => onOpen(job)}
      className="w-full text-left bg-white border rounded-2xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">{job.jobRole}</div>
          <div className="text-sm font-semibold text-gray-500 mt-1">{job.city}</div>
        </div>

        {job.urgentActive && (
          <div className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold">
            URGENT
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400 font-semibold">
        Views: {job.views || 0}
      </div>
    </button>
  );
}
