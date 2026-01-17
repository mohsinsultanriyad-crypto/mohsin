import { useState } from "react";

export default function EditModal({ open, job, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    companyName: job?.companyName || "",
    phone: job?.phone || "",
    city: job?.city || "Riyadh",
    jobRole: job?.jobRole || "helper",
    description: job?.description || "",
    isUrgent: !!job?.isUrgent
  }));

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5">
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold">Edit Job</div>
          <button onClick={onClose} className="h-10 px-4 rounded-2xl bg-gray-50 border font-extrabold">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
            value={form.companyName}
            onChange={(e)=>setForm({...form, companyName:e.target.value})}
            placeholder="Company Name"
          />
          <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
            value={form.phone}
            onChange={(e)=>setForm({...form, phone:e.target.value})}
            placeholder="Phone"
          />
          <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
            value={form.city}
            onChange={(e)=>setForm({...form, city:e.target.value})}
            placeholder="City"
          />
          <input className="w-full h-12 border rounded-2xl px-4 font-semibold"
            value={form.jobRole}
            onChange={(e)=>setForm({...form, jobRole:e.target.value})}
            placeholder="Role"
          />
          <textarea className="w-full border rounded-2xl px-4 py-3 font-semibold"
            rows={4}
            value={form.description}
            onChange={(e)=>setForm({...form, description:e.target.value})}
            placeholder="Description"
          />
          <label className="flex items-center gap-3 font-extrabold text-gray-700">
            <input type="checkbox" checked={form.isUrgent} onChange={(e)=>setForm({...form, isUrgent:e.target.checked})} />
            Urgent (24h)
          </label>
        </div>

        <button
          onClick={() => onSave(form)}
          className="mt-4 w-full h-12 rounded-2xl bg-black text-white font-extrabold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
