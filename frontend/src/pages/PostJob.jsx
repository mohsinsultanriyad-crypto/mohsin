import { useState } from "react";
import { createJob } from "../services/api.js";
import FooterLinks from "../components/FooterLinks.jsx";

const CITIES = [
  "Riyadh","Jeddah","Dammam","Khobar","Jubail","Mecca","Medina","Taif","Tabuk","Hail","Abha","Jazan","Najran","Al Ahsa"
];

const ROLES = [
  "Helper","Driver","Painter","Plumber","Electrician","Welder","Pipe Fitter","Pipe Fabricator","Scaffolder","Rigger","Safety Officer","QC Inspector","Supervisor","Carpenter","Mason"
];

export default function PostJob({ go }) {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    city: "Riyadh",
    jobRole: "Helper",
    description: "",
    isUrgent: false,
  });
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      const payload = {
        ...form,
        email: String(form.email || "").trim().toLowerCase(),
        name: String(form.name || "").trim(),
        phone: String(form.phone || "").trim(),
        description: String(form.description || "").trim(),
        jobRole: String(form.jobRole || "").trim(),
        city: String(form.city || "").trim(),
      };
      if (!payload.name || !payload.phone || !payload.email || !payload.description) {
        alert("Please fill all required fields.");
        return;
      }
      await createJob(payload);
      alert("Job posted successfully.");
      setForm((p) => ({ ...p, description: "", isUrgent: false }));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to post job.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontWeight: 800,
    marginTop: 10,
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>Post Job</div>
      <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 700 }}>
        City & role are standardized to avoid mismatch.
      </div>

      <input style={inputStyle} placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />

      <input style={inputStyle} placeholder="Company Name (optional)" value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })} />

      <input style={inputStyle} placeholder="Phone" value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} />

      <input style={inputStyle} placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />

      <select style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select style={inputStyle} value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })}>
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <textarea
        style={{ ...inputStyle, height: 110, paddingTop: 10 }}
        placeholder="Job Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, fontWeight: 900 }}>
        <input
          type="checkbox"
          checked={form.isUrgent}
          onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
        />
        Urgent Hiring (Top highlight 24 hours)
      </label>

      <button
        onClick={submit}
        disabled={loading}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 12,
          marginTop: 14,
          border: "none",
          background: "#111827",
          color: "#fff",
          fontWeight: 900,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Posting..." : "Publish Job"}
      </button>

      <FooterLinks go={go} />
    </div>
  );
}
