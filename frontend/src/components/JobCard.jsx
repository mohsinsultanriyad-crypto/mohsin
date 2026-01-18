export default function JobCard({ job, onClick }) {
  const urgentActive = job.urgent && job.urgentUntil && new Date(job.urgentUntil) > new Date();

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border bg-white p-4 shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-semibold">{job.jobRole}</div>
          <div className="text-sm text-gray-500">{job.city}</div>
        </div>
        {urgentActive && (
          <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            Urgent
          </div>
        )}
      </div>
      <div className="mt-2 line-clamp-2 text-sm text-gray-700">{job.description}</div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>Views: {job.views || 0}</span>
        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
