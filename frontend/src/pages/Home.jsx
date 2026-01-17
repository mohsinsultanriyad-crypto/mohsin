import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import DetailsModal from "../components/DetailsModal";
import { getJobs } from "../services/api";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  async function loadJobs() {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error("Load jobs error:", err);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div className="page">
      <h2>Latest jobs (auto expiry 15 days)</h2>

      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onClick={() => setSelectedJob(job)} />
      ))}

      {selectedJob && (
        <DetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
