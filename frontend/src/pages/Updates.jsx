import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";
import { fetchJobs, viewJob } from "../services/jobsApi.js";
import { getSavedJobs } from "../lib/storage.js";
import { useLocation } from "react-router-dom";

export default function Updates() {
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const savedIds = getSavedJobs(); // array of saved jobIds
      if (!savedIds.length) {
        setSavedJobs([]);
        return;
      }

      const jobs = await fetchJobs(); // all active jobs
      const saved = jobs.filter((j) => savedIds.includes(String(j._id))); // ✅ NO LIMIT
      setSavedJobs(saved);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // ✅ update when user comes back (mobile) or same tab focus
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function openJob(job) {
    setActive({ type: "job", job });
    setOpen(true);
    try {
      await viewJob(job._id);
    } catch {}
  }

  // ✅ notification click: /updates?jobId=xxx
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(loc.search);
    const jobId = params.get("jobId");
    if (!jobId) return;

    const found = savedJobs.find((j) => String(j._id) === String(jobId));
    if (found) openJob(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loc.search]);

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Saved Jobs</div>
        <div className="mt-1 text-sm text-gray-500">Your saved jobs</div>
      </div>

      {loading ? <Loading /> : null}

      {!loading && savedJobs.length === 0 ? (
        <Empty title="No saved jobs" desc="Save a job and it will appear here." />
      ) : null}

      {!loading && savedJobs.length > 0 ? (
        <div className="space-y-3">
          {savedJobs.map((j) => (
            <JobCard key={j._id} job={j} onOpen={() => openJob(j)} />
          ))}
        </div>
      ) : null}

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          active?.type === "job"
            ? `${active.job.jobRole} • ${active.job.city}`
            : "Details"
        }
      >
        {active?.type === "job" ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {active.job.description}
            </div>

            <a
              className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={`https://wa.me/${String(active.job.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello, I want to apply for ${active.job.jobRole} in ${active.job.city}.`
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
}import { useEffect, useState } from "react";
 import Loading from "../components/Loading.jsx";
 import Empty from "../components/Empty.jsx";
 import ModalSheet from "../components/ModalSheet.jsx";
 import JobCard from "../components/JobCard.jsx";
 import { fetchJobs, viewJob } from "../services/jobsApi.js";
 import { getSavedJobs } from "../lib/storage.js";
 import { useLocation } from "react-router-dom";

 export default function Updates() {
   const loc = useLocation();

   const [loading, setLoading] = useState(true);
   const [savedJobs, setSavedJobs] = useState([]);

   const [open, setOpen] = useState(false);
   const [active, setActive] = useState(null);

   async function load() {
     setLoading(true);
     try {
       const savedIds = getSavedJobs(); // array of saved jobIds
       if (!savedIds.length) {
         setSavedJobs([]);
         return;
       }

       const jobs = await fetchJobs(); // all active jobs
       const saved = jobs.filter((j) => savedIds.includes(String(j._id))); // ✅ NO LIMIT
       setSavedJobs(saved);
     } finally {
       setLoading(false);
     }
   }

   useEffect(() => {
     load();

     // ✅ update when user comes back (mobile) or same tab focus
     const onFocus = () => load();
     window.addEventListener("focus", onFocus);

     return () => window.removeEventListener("focus", onFocus);
   }, []);

   async function openJob(job) {
     setActive({ type: "job", job });
     setOpen(true);
     try {
       await viewJob(job._id);
     } catch {}
   }

   // ✅ notification click: /updates?jobId=xxx
   useEffect(() => {
     if (loading) return;

     const params = new URLSearchParams(loc.search);
     const jobId = params.get("jobId");
     if (!jobId) return;

     const found = savedJobs.find((j) => String(j._id) === String(jobId));
     if (found) openJob(found);
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [loading, loc.search]);

   return (
     <div>
       <div className="mb-3">
         <div className="text-lg font-bold text-gray-900">Saved Jobs</div>
         <div className="mt-1 text-sm text-gray-500">Your saved jobs</div>
       </div>

       {loading ? <Loading /> : null}

       {!loading && savedJobs.length === 0 ? (
         <Empty title="No saved jobs" desc="Save a job and it will appear here." />
       ) : null}

       {!loading && savedJobs.length > 0 ? (
         <div className="space-y-3">
           {savedJobs.map((j) => (
             <JobCard key={j._id} job={j} onOpen={() => openJob(j)} />
           ))}
         </div>
       ) : null}

       <ModalSheet
         open={open}
         onClose={() => setOpen(false)}
         title={
           active?.type === "job"
             ? `${active.job.jobRole} • ${active.job.city}`
             : "Details"
         }
       >
         {active?.type === "job" ? (
           <div className="space-y-3">
             <div className="text-sm text-gray-700 whitespace-pre-wrap">
               {active.job.description}
             </div>

             <a
               className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
               href={`https://wa.me/${String(active.job.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                 `Hello, I want to apply for ${active.job.jobRole} in ${active.job.city}.`
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