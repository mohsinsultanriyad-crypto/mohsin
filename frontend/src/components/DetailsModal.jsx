export default function DetailsModal({ open, onClose, job }) {
  if (!open || !job) return null;

  const whatsapp = String(job.phone || "").replace(/\D/g, "");

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{job.jobRole}</h2>
            <p className="text-gray-600">{job.city}</p>
            <p className="text-gray-500 text-sm">Views: {job.views ?? 0}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-[15px]">
          <p>
            <b>Company:</b> {job.companyName || "-"}
          </p>
          <p>
            <b>Contact:</b> {job.phone || "-"}
          </p>
          <p>
            <b>Email (owner):</b> {job.email || "-"}
          </p>

          <div className="mt-3 rounded-xl border p-3 bg-gray-50 whitespace-pre-wrap">
            {job.description || "-"}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            className="inline-block w-full rounded-xl bg-green-600 py-3 text-center font-bold text-white"
            href={whatsapp ? `https://wa.me/${whatsapp}` : "#"}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Apply
          </a>
        </div>
      </div>
    </div>
  );
}
