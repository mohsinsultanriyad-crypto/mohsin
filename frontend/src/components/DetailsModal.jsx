import { deleteJob } from "../services/api";

export default function DetailsModal({ job, onClose, onDeleteSuccess }) {
  async function handleDelete() {
    const email = prompt("Enter owner email to delete:");
    if (!email) return;

    try {
      await deleteJob(job._id, email);
      alert("Job deleted");

      // remove from Alerts + Home instantly
      if (onDeleteSuccess) onDeleteSuccess(job._id);

      onClose();
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{job.jobRole}</h2>
        <p>{job.city}</p>
        <p><b>Company:</b> {job.companyName}</p>
        <p><b>Contact:</b> {job.phone}</p>
        <p><b>Email:</b> {job.email}</p>
        <p>{job.description}</p>

        <button onClick={onClose}>Close</button>

        <button onClick={handleDelete} style={{ background: "red", color: "#fff" }}>
          Delete Job
        </button>

        <a
          href={`https://wa.me/${job.phone}?text=Hello I am interested`}
          target="_blank"
        >
          WhatsApp Apply
        </a>
      </div>
    </div>
  );
}
