import { useEffect, useState } from "react";
import { api } from "../services/api";
import Sheet from "../components/Sheet";

export default function MyPosts() {
  const [email, setEmail] = useState(localStorage.getItem("SJ_MYPOSTS_EMAIL") || "");
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    if (!email) return setJobs([]);
    const data = await api.mine(email);
    setJobs(data || []);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function onSearch() {
    localStorage.setItem("SJ_MYPOSTS_EMAIL", email);
    await load();
  }

  async function onDelete(job) {
    const ok = confirm("Delete this job?");
    if (!ok) return;
    try {
      await api.deleteJob(job._id, email);
      alert("Deleted");
      await load();
    } catch {
      alert("Delete failed (email verify?)");
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 text-xl font-bold text-blue-700">My Posts</div>

      <div className="mb-4 rounded-2xl border bg-white p-4">
        <div className="text-sm text-gray-700">Enter email used while posting job</div>
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded-2xl border p-3 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={onSearch} className="rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white">
            Search
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
            No posts found.
          </div>
        ) : (
          jobs.map((j) => (
            <div key={j._id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{j.jobRole}</div>
                  <div className="text-sm text-gray-500">{j.city}</div>
                </div>
                <button onClick={() => onDelete(j)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  Delete
                </button>
              </div>

              <div className="mt-2 line-clamp-2 text-sm text-gray-700">{j.description}</div>

              <button
                onClick={() => { setSelected(j); setOpen(true); }}
                className="mt-3 w-full rounded-2xl bg-gray-100 py-3 text-sm font-semibold text-gray-700"
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={selected ? `${selected.jobRole} • ${selected.city}` : "Job"}>
        {selected && (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">{selected.description}</div>
            <div className="text-xs text-gray-500">Views: {selected.views || 0}</div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
