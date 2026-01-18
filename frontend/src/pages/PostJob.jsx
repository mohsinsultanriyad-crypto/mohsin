import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { cities } from "../utils/cities";
import { roles } from "../utils/roles";

export default function PostJob() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Riyadh");
  const [jobRole, setJobRole] = useState("Helper");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);

  async function publish() {
    try {
      setLoading(true);
      await api.postJob({ name, companyName, phone, email, city, jobRole, description, urgent });
      alert("Job posted successfully");
      nav("/");
    } catch (e) {
      alert("Post failed. Check fields.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 text-xl font-bold text-blue-700">Post Job</div>

      <div className="space-y-3">
        <input className="w-full rounded-2xl border p-3 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-2xl border p-3 text-sm" placeholder="Company Name (optional)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <input className="w-full rounded-2xl border p-3 text-sm" placeholder="Phone (WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full rounded-2xl border p-3 text-sm" placeholder="Email (for My Posts)" value={email} onChange={(e) => setEmail(e.target.value)} />

        <select className="w-full rounded-2xl border p-3 text-sm" value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="w-full rounded-2xl border p-3 text-sm" value={jobRole} onChange={(e) => setJobRole(e.target.value)}>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <textarea className="w-full rounded-2xl border p-3 text-sm" rows={5} placeholder="Job Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          Urgent Hiring (24h highlight)
        </label>

        <button
          onClick={publish}
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish Job"}
        </button>
      </div>
    </div>
  );
}
