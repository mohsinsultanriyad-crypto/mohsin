import { useEffect, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import { getJobs, getJobById } from "../services/api.js";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const data = await getJobs({ limit: 30, skip: 0 });
    setJobs(data.items || []);
  }

  useEffect(() => { load(); }, []);

  // openJob param support (notification click)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("openJob");
    if (!id) return;

    (async () => {
      try {
        const job = await getJobById(id);
        setSelected(job);
        setOpen(true);
      } catch {}
    })();
  }, []);

  function openJob(job) {
    setSelected(job);
    setOpen(true);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-24">
      <div className="text-3xl font-extrabold">Jobs</div>
      <div className="mt-1 text-gray-500 font-semibold">Latest jobs (auto expiry 15 days)</div>

      <div className="mt-5 space-y-3">
        {jobs.map((j) => (
          <JobCard key={j._id} job={j} onOpen={openJob} />
        ))}
      </div>

      <DetailsModal open={open} job={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
