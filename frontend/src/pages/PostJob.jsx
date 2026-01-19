import { useState } from "react";
import Card from "../components/Card.jsx";
import { postJob } from "../services/jobsApi.js";

const cities = [
  "Riyadh","Jeddah","Dammam","Khobar","Jubail","Mecca","Medina","Taif",
  "Tabuk","Hail","Abha","Jazan","Najran","Al Ahsa"
];

const roles = [
  "Helper","Driver","Painter","Electrician","Plumber","Welder","Pipe Fitter",
  "Scaffolder","Mason","Carpenter","AC Technician"
];

function isValidEmail(v) {
  return /^\S+@\S+\.\S+$/.test(v);
}

function normalizePhone(v) {
  // keep + and digits only
  const s = String(v || "").trim();
  const hasPlus = s.startsWith("+");
  const digits = s.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
}

export default function PostJob() {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Riyadh");
  const [jobRole, setJobRole] = useState("Helper");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);

  async function handlePublish() {
    if (loading) return; // ✅ prevent double submit

    const cleanName = name.trim();
    const cleanCompany = companyName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizePhone(phone);
    const cleanDesc = description.trim();

    // ✅ Required checks
    if (!cleanName) return alert("Enter your name");
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 8)
      return alert("Enter valid phone / WhatsApp number");
    if (!cleanEmail || !isValidEmail(cleanEmail))
      return alert("Enter valid email");
    if (!cleanDesc || cleanDesc.length < 10)
      return alert("Description must be at least 10 characters");

    try {
      setLoading(true);

      await postJob({
        name: cleanName,
        companyName: cleanCompany,
        phone: cleanPhone,
        email: cleanEmail,
        city,
        jobRole,
        description: cleanDesc,
        urgent
      });

      alert("Job posted successfully.");

      setName("");
      setCompanyName("");
      setPhone("");
      setEmail("");
      setCity("Riyadh");
      setJobRole("Helper");
      setDescription("");
      setUrgent(false);
    } catch (e) {
      alert(e?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Post Job</div>
        <div className="mt-1 text-sm text-gray-500">Publish job to all users</div>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={setName} placeholder="Your name" />
          <Input
            label="Company Name (optional)"
            value={companyName}
            onChange={setCompanyName}
            placeholder="Company name"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="WhatsApp number (ex: +9665xxxxxxx)"
          />
          <Input
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="Email for My Posts (edit/delete)"
          />

          <Select label="City" value={city} onChange={setCity} options={cities} />
          <Select label="Job Role" value={jobRole} onChange={setJobRole} options={roles} />

          <div>
            <div className="mb-1 text-xs font-semibold text-gray-700">Description</div>
            <textarea
              className="w-full rounded-2xl bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job details..."
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
            disabled={loading}
            onClick={handlePublish}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Publish Job"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-gray-700">{label}</div>
      <input
        className="w-full rounded-2xl bg-gray-50 px-3 py-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-gray-700">{label}</div>
      <select
        className="w-full rounded-2xl bg-gray-50 px-3 py-3 text-sm text-gray-800 ring-1 ring-black/5 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option value={o} key={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
