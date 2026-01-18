import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Job Schema (simple + production ready for your v1.3)
 */
const JobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    urgent: { type: Boolean, default: false },
    urgentUntil: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false }
);

JobSchema.index({ expiresAt: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ jobRole: 1 });
JobSchema.index({ email: 1 });

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

/**
 * Helpers
 */
function now() {
  return new Date();
}

function isValidEmail(v) {
  return typeof v === "string" && v.includes("@") && v.includes(".");
}

function normalizeRole(v) {
  return String(v || "").trim();
}

function cleanJob(j) {
  return {
    _id: j._id,
    name: j.name,
    companyName: j.companyName,
    phone: j.phone,
    email: j.email,
    city: j.city,
    jobRole: j.jobRole,
    description: j.description,
    urgent: j.urgent,
    urgentUntil: j.urgentUntil,
    createdAt: j.createdAt,
    expiresAt: j.expiresAt,
    views: j.views,
  };
}

/**
 * ✅ GET /api/jobs
 * returns only active jobs (not expired, not deleted)
 * Sorting:
 *  - urgent jobs (urgentUntil > now) first
 *  - then newest
 */
router.get("/", async (req, res) => {
  try {
    const t = now();

    const jobs = await Job.find({
      isDeleted: false,
      expiresAt: { $gt: t },
    })
      .sort({ urgentUntil: -1, createdAt: -1 })
      .limit(500)
      .lean();

    // urgentUntil sort works, but ensure "urgent active" stays top
    const urgentActive = [];
    const normal = [];
    for (const j of jobs) {
      if (j.urgentUntil && new Date(j.urgentUntil) > t) urgentActive.push(j);
      else normal.push(j);
    }

    res.json({
      ok: true,
      jobs: [...urgentActive, ...normal].map(cleanJob),
    });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

/**
 * ✅ POST /api/jobs
 * Body: { name, companyName?, phone, email, city, jobRole, description, urgent }
 * Sets:
 *  createdAt
 *  urgentUntil = createdAt + 24h (if urgent)
 *  expiresAt = createdAt + 15 days
 *  views = 0
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      companyName = "",
      phone,
      email,
      city,
      jobRole,
      description,
      urgent = false,
    } = req.body || {};

    if (!name || !phone || !email || !city || !jobRole || !description) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email" });
    }

    const createdAt = now();
    const expiresAt = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);
    const urgentUntil = urgent
      ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
      : null;

    const job = await Job.create({
      name: String(name).trim(),
      companyName: String(companyName || "").trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      city: String(city).trim(),
      jobRole: normalizeRole(jobRole),
      description: String(description).trim(),
      urgent: !!urgent,
      urgentUntil,
      createdAt,
      expiresAt,
      views: 0,
      isDeleted: false,
    });

    res.json({ ok: true, job: cleanJob(job) });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

/**
 * ✅ POST /api/jobs/:id/view
 * increments view counter
 */
router.post("/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    await Job.updateOne(
      { _id: id, isDeleted: false },
      { $inc: { views: 1 } }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, message: "Invalid id" });
  }
});

/**
 * ✅ GET /api/jobs/myposts?email=...
 * returns active jobs by same email
 */
router.get("/myposts", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email" });
    }

    const t = now();

    const jobs = await Job.find({
      isDeleted: false,
      expiresAt: { $gt: t },
      email,
    })
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();

    res.json({ ok: true, jobs: jobs.map(cleanJob) });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

/**
 * ✅ PATCH /api/jobs/:id
 * Body: { email, name?, companyName?, phone?, city?, jobRole?, description?, urgent? }
 * Only owner by email can edit
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email" });
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) return res.status(404).json({ ok: false, message: "Not found" });

    if (job.email !== email) {
      return res.status(403).json({ ok: false, message: "Email not matched" });
    }

    const updates = {};
    const allow = ["name", "companyName", "phone", "city", "jobRole", "description"];

    for (const k of allow) {
      if (req.body[k] !== undefined) updates[k] = String(req.body[k]).trim();
    }
    if (updates.jobRole) updates.jobRole = normalizeRole(updates.jobRole);

    // urgent update
    if (req.body.urgent !== undefined) {
      const urgent = !!req.body.urgent;
      updates.urgent = urgent;
      updates.urgentUntil = urgent ? new Date(now().getTime() + 24 * 60 * 60 * 1000) : null;
    }

    await Job.updateOne({ _id: id }, { $set: updates });

    const updated = await Job.findById(id).lean();
    res.json({ ok: true, job: cleanJob(updated) });
  } catch (e) {
    res.status(400).json({ ok: false, message: "Invalid id" });
  }
});

/**
 * ✅ DELETE /api/jobs/:id
 * Body: { email }
 * Only owner by email can delete
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email" });
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) return res.status(404).json({ ok: false, message: "Not found" });

    if (job.email !== email) {
      return res.status(403).json({ ok: false, message: "Email not matched" });
    }

    await Job.updateOne({ _id: id }, { $set: { isDeleted: true } });

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, message: "Invalid id" });
  }
});

export default router;