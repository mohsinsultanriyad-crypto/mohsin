import { useEffect, useState } from "react";
import { createJob, getMeta } from "../services/api.js";

export default function PostJob() {
  const [meta, setMeta] = useState({ cities: [], roles: [] });

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    city: "Riyadh",
    jobRole: "helper",
    description: "",
    isUrgent: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const m = await getMeta();
        setMeta(m);
        setForm((f) => ({
          ...f,
          city: m.cities?.[0] || "Riyadh",
          jobRole: m.roles?.[0] || "helper"
        }));
      } catch {}
    })();
  }, []);

  async function submit() {
    try {
      setLoading(true);
      await createJob(form);
      alert("Job posted");
      setForm((f) => ({ ...f, description: "", isUrgent: false }));
    } catch (e) {
      alert(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-24">
      <div className="text-3xl font-extrabold">Post Job</div>

      <div className="mt-5 space-y-3">
        <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}
          placeholder="Your Name"
        />
        <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.companyName} onChange={(e)=>setForm({...form, companyName:e.target.value})}
          placeholder="Company Name (optional)"
        />
        <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}
          placeholder="Phone"
        />
        <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}
          placeholder="Email (for edit/delete verification)"
        />

        <select className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})}>
          {meta.cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="w-full h-12 border rounded-2xl px-4 font-semibold"
          value={form.jobRole} onChange={(e)=>setForm({...form, jobRole:e.target.value})}>
          {meta.roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <textarea className="w-full border rounded-2xl px-4 py-3 font-semibold" rows={5}
          value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}
          placeholder="Job Description"
        />

        <label className="flex items-center gap-3 font-extrabold text-gray-700">
          <input type="checkbox" checked={form.isUrgent} onChange={(e)=>setForm({...form, isUrgent:e.target.checked})} />
          Urgent hiring (24h highlight)
        </label>

        <button
          disabled={loading}
          onClick={submit}
          className="w-full h-12 rounded-2xl bg-black text-white font-extrabold disabled:opacity-60"
        >
          {loading ? "Posting..." : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
