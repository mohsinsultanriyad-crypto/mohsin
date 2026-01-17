import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import DetailsModal from "../components/DetailsModal";
import { getJobs } from "../services/api";

export default function Alerts() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);

  async function loadAlerts() {
    const data = await getJobs();
    setJobs(data);

    // reset unread badge count
    localStorage.setItem("alertCount", 0);
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  // Remove deleted job live
  function removeDeleted(id) {
    const updated = jobs.filter((j) => j._id !== id);
    setJobs(updated);
  }

  return (
    <div className="page">
      <h2>Job Alerts</h2>

      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          onClick={() => setSelected(job)}
        />
      ))}

      {selected && (
        <DetailsModal
          job={selected}
          onClose={() => setSelected(null)}
          onDeleteSuccess={removeDeleted}
        />
      )}
    </div>
  );
}
