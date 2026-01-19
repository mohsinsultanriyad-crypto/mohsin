import express from "express";
import { Job } from "../models/Job.js";
import { jobCreateSchema, jobDeleteSchema, jobUpdateSchema } from "../utils/validate.js";
import { calcExpiry, calcUrgentUntil, getActiveJobs } from "../services/jobService.js";
import { Token } from "../models/Token.js";
import { isFirebaseReady, sendPushToTokens } from "../services/fcm.js";
import { uniq } from "../utils/sanitize.js";

const router = express.Router();

/**
 * GET /api/jobs
 * Active jobs only
 */
router.get("/", async (req, res, next) => {
  try {
    const jobs = await getActiveJobs();
    res.json({ ok: true, jobs });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/jobs
 * Create job + send role-based push
 */
router.post("/", async (req, res, next) => {
  try {
    const parsed = jobCreateSchema.parse(req.body);

    const expiresAt = calcExpiry();
    const urgentUntil = calcUrgentUntil(!!parsed.urgent);

    const job = await Job.create({
      ...parsed,
      companyName: parsed.companyName || "",
      urgentUntil,
      expiresAt
    });

    // 🔔 Role-based push
    if (isFirebaseReady()) {
      const role = String(parsed.jobRole).trim();
      const tokensDocs = await Token.find({ roles: role }).lean();
      const tokens = tokensDocs.map((t) => t.token);

      const payload = {
        title: `New Job: ${role}`,
        body: `${parsed.city} • Tap to open`,
        data: {
          type: "job",
          targetTab: "alerts",
          jobId: String(job._id)
        }
      };

      const pushRes = await sendPushToTokens(tokens, payload);

      // Optional: remove invalid tokens (best effort)
      if (pushRes?.responses?.length) {
        const invalid = [];
        pushRes.responses.forEach((r, i) => {
          if (!r.success) {
            const code = r.error?.code || "";
            if (
              code.includes("registration-token-not-registered") ||
              code.includes("invalid-argument")
            ) {
              invalid.push(tokens[i]);
            }
          }
        });
        if (invalid.length) {
          await Token.deleteMany({ token: { $in: uniq(invalid) } });
        }
      }
    }

    res.status(201).json({ ok: true, job });
  } catch (e) {
    if (e?.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Invalid data", issues: e.issues });
    }
    next(e);
  }
});

/**
 * PATCH /api/jobs/:id
 * Edit only by owner email (verify in body)
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, message: "email required" });

    const update = jobUpdateSchema.parse(req.body);

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ ok: false, message: "Job not found" });

    if (String(job.email).toLowerCase() !== email) {
      return res.status(403).json({ ok: false, message: "Email verification failed" });
    }

    // urgent: if true -> set urgentUntil 24h from now, if false -> null
    if (typeof update.urgent === "boolean") {
      job.urgentUntil = update.urgent ? calcUrgentUntil(true) : null;
    }

    if (typeof update.companyName === "string") job.companyName = update.companyName;
    if (typeof update.phone === "string") job.phone = update.phone;
    if (typeof update.city === "string") job.city = update.city;
    if (typeof update.jobRole === "string") job.jobRole = update.jobRole;
    if (typeof update.description === "string") job.description = update.description;

    await job.save();

    res.json({ ok: true, job });
  } catch (e) {
    if (e?.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Invalid data", issues: e.issues });
    }
    next(e);
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete only by owner email
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = jobDeleteSchema.parse(req.body);

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ ok: false, message: "Job not found" });

    if (String(job.email).toLowerCase() !== String(parsed.email).toLowerCase()) {
      return res.status(403).json({ ok: false, message: "Email verification failed" });
    }

    await Job.deleteOne({ _id: id });

    res.json({ ok: true });
  } catch (e) {
    if (e?.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Invalid data", issues: e.issues });
    }
    next(e);
  }
});

/**
 * POST /api/jobs/:id/view
 * increments view counter
 */
router.post("/:id/view", async (req, res, next) => {
  try {
    const { id } = req.params;
    await Job.updateOne({ _id: id }, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
