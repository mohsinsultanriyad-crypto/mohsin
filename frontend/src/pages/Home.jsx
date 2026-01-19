import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import JobCard from "../components/JobCard.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import { fetchJobs, viewJob } from "../services/jobsApi.js";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchJobs();
      setJobs(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openJob(job) {
    setActive(job);
    setOpen(true);
    try {
      await viewJob(job._id);
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, views: (j.views || 0) + 1 } : j))
      );
    } catch {}
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">All Jobs</div>
        <div className="mt-1 text-sm text-gray-500">Latest active jobs</div>
      </div>

      {loading ? <Loading /> : null}
      {!loading && jobs.length === 0 ? (
        <Empty title="No jobs yet" desc="New jobs will appear here." />
      ) : null}

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
        ))}
      </div>

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={active ? `${active.jobRole} • ${active.city}` : "Job"}
      >
        {active ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{active.description}</div>

            <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-black/5">
              <div className="text-xs text-gray-500">Posted by</div>
              <div className="mt-1 text-sm font-semibold text-gray-800">
                {active.companyName ? active.companyName : active.name}
              </div>
              <div className="mt-1 text-sm text-gray-600">{active.phone}</div>
            </div>

            <a
              className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={`https://wa.me/${String(active.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello, I want to apply for ${active.jobRole} in ${active.city}.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Apply on WhatsApp
            </a>
          </div>
        ) : null}
      </ModalSheet>
    </div>
  );
}
