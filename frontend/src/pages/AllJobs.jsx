import { useEffect, useState } from "react";
import { api } from "../services/api";
import JobCard from "../components/JobCard";
import Sheet from "../components/Sheet";

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    const data = await api.getJobs();
    setJobs(data || []);
  }

  useEffect(() => { load(); }, []);

  async function openJob(job) {
    setSelected(job);
    setOpen(true);
    try {
      await api.viewJob(job._id);
    } catch {}
  }

  const whatsapp = (job) => {
    const msg = encodeURIComponent(`Hi, I want to apply for ${job.jobRole} in ${job.city}.`);
    const phone = (job.phone || "").replace(/\s+/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 text-xl font-bold text-blue-700">All Jobs</div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
            No jobs right now. Please check again later.
          </div>
        ) : (
          jobs.map((j) => (
            <JobCard key={j._id} job={j} onClick={() => openJob(j)} />
          ))
        )}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? `${selected.jobRole} • ${selected.city}` : "Job"}
      >
        {selected && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">{selected.description}</div>
            <div className="text-xs text-gray-500">
              Posted by: {selected.name} {selected.companyName ? `(${selected.companyName})` : ""}
            </div>
            <button
              onClick={() => whatsapp(selected)}
              className="w-full rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white"
            >
              Apply on WhatsApp
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
