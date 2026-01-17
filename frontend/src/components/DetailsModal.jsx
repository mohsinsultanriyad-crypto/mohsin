import { viewJob } from "../services/api.js";

export default function DetailsModal({ open, job, onClose }) {
  if (!open || !job) return null;

  async function onOpenWhatsApp() {
    try { await viewJob(job._id); } catch {}
    const msg = encodeURIComponent(`Hello, I am interested in this job: ${job.jobRole} in ${job.city}`);
    const phone = String(job.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-extrabold">{job.jobRole}</div>
            <div className="text-gray-500 font-semibold mt-1">{job.city}</div>
          </div>
          <button onClick={onClose} className="h-10 px-4 rounded-2xl bg-gray-50 border font-extrabold">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm font-semibold text-gray-700">
          <div>Company: {job.companyName || "-"}</div>
          <div>Contact: {job.phone}</div>
          <div>Email (owner): {job.email}</div>
        </div>

        <div className="mt-4 bg-gray-50 border rounded-2xl p-4 text-gray-700 font-semibold">
          {job.description}
        </div>

        <button
          onClick={onOpenWhatsApp}
          className="mt-4 w-full h-12 rounded-2xl bg-green-600 text-white font-extrabold"
        >
          WhatsApp Apply
        </button>
      </div>
    </div>
  );
}
