import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import JobCard from "../components/JobCard.jsx";

import { fetchJobs, updateJob, deleteJob } from "../services/jobsApi.js";
import { getMyEmail, setMyEmail } from "../lib/storage.js";

export default function MyPosts() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const [email, setEmail] = useState(getMyEmail());
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const myJobs = useMemo(() => {
    if (!email) return [];
    const e = email.trim().toLowerCase();
    return jobs.filter((j) => String(j.email || "").toLowerCase() === e);
  }, [jobs, email]);

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

  useEffect(() => {
    setMyEmail(email);
  }, [email]);

  function openJob(job) {
    setActive(job);
    setOpen(true);
  }

  async function onSaveEdit(next) {
    try {
      const updated = await updateJob(next._id, {
        email,
        companyName: next.companyName || "",
        phone: next.phone,
        city: next.city,
        jobRole: next.jobRole,
        description: next.description,
        urgent: !!next.urgent
      });
      setJobs((prev) => prev.map((j) => (j._id === updated._id ? { ...j, ...updated } : j)));
      alert("Updated.");
      setOpen(false);
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  }

  async function onDelete(jobId) {
    const ok = confirm("Delete this job?");
    if (!ok) return;
    try {
      await deleteJob(jobId, email);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      alert("Deleted.");
      setOpen(false);
    } catch (e) {
      alert(e?.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">My Posts</div>
        <div className="mt-1 text-sm text-gray-500">Manage your jobs by email</div>
      </div>

      <Card className="p-4">
        <div className="text-xs font-semibold text-gray-700">Your Email</div>
        <input
          className="mt-2 w-full rounded-2xl bg-gray-50 px-3 py-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter the same email used while posting"
        />
        <div className="mt-2 text-xs text-gray-500">
          This email is used for edit/delete verification.
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Your Jobs</div>
        <button
          className="rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          onClick={load}
          type="button"
        >
          Refresh
        </button>
      </div>

      {loading ? <Loading /> : null}
      {!loading && !email ? (
        <Empty title="Enter your email" desc="Then your posts will show here." />
      ) : null}
      {!loading && email && myJobs.length === 0 ? (
        <Empty title="No jobs found" desc="Make sure you entered correct email." />
      ) : null}

      <div className="mt-3 space-y-3">
        {myJobs.map((job) => (
          <JobCard key={job._id} job={job} onOpen={() => openJob(job)} />
        ))}
      </div>

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={active ? `Edit: ${active.jobRole}` : "Edit"}
      >
        {active ? (
          <EditForm
            initial={active}
            onSave={onSaveEdit}
            onDelete={() => onDelete(active._id)}
          />
        ) : null}
      </ModalSheet>
    </div>
  );
}

function EditForm({ initial, onSave, onDelete }) {
  const [companyName, setCompanyName] = useState(initial.companyName || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [city, setCity] = useState(initial.city || "");
  const [jobRole, setJobRole] = useState(initial.jobRole || "");
  const [description, setDescription] = useState(initial.description || "");
  const [urgent, setUrgent] = useState(!!initial.urgentActive);

  return (
    <div className="space-y-3">
      <Field label="Company Name" value={companyName} onChange={setCompanyName} />
      <Field label="Phone" value={phone} onChange={setPhone} />
      <Field label="City" value={city} onChange={setCity} />
      <Field label="Job Role" value={jobRole} onChange={setJobRole} />

      <div>
        <div className="mb-1 text-xs font-semibold text-gray-700">Description</div>
        <textarea
          className="w-full rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        type="button"
        className={[
          "flex w-full items-center justify-between rounded-2xl px-4 py-3 ring-1 ring-black/5",
          urgent ? "bg-red-50" : "bg-gray-50"
        ].join(" ")}
        onClick={() => setUrgent((v) => !v)}
      >
        <div className="text-sm font-semibold text-gray-800">Urgent Hiring (24h)</div>
        <div className="text-sm font-semibold">{urgent ? "ON" : "OFF"}</div>
      </button>

      <button
        className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
        type="button"
        onClick={() =>
          onSave({
            ...initial,
            companyName,
            phone,
            city,
            jobRole,
            description,
            urgent
          })
        }
      >
        Save Changes
      </button>

      <button
        className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
        type="button"
        onClick={onDelete}
      >
        Delete Job
      </button>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-gray-700">{label}</div>
      <input
        className="w-full rounded-2xl bg-gray-50 px-3 py-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

