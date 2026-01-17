import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { z } from "zod";
import "dotenv/config";

import { connectDB } from "./db.js";
import Job from "./models/Job.js";
import PushToken from "./models/PushToken.js";
import pushRoutes from "./routes/push.js";
import { initFirebaseAdmin } from "./firebaseAdmin.js";

const admin = initFirebaseAdmin();

const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.use("/api/push", pushRoutes);

await connectDB();

const CITIES = [
  "Riyadh","Jeddah","Dammam","Khobar","Jubail","Mecca","Medina","Taif","Tabuk","Hail","Abha","Jazan","Najran","Al Ahsa"
];
const ROLES = [
  "helper","driver","painter","plumber","electrician","welder",
  "pipe fitter","pipe fabricator","scaffolder","supervisor","qc inspector","safety officer",
  "mason","carpenter","rigger"
];

const createSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional().or(z.literal("")).optional(),
  phone: z.string().min(6),
  email: z.string().email(),
  city: z.string().min(2),
  jobRole: z.string().min(2),
  description: z.string().min(2),
  isUrgent: z.boolean().optional()
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional().or(z.literal("")).optional(),
  phone: z.string().min(6).optional(),
  city: z.string().min(2).optional(),
  jobRole: z.string().min(2).optional(),
  description: z.string().min(2).optional(),
  isUrgent: z.boolean().optional()
});

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function normalizeRole(r) {
  return String(r || "").trim().toLowerCase();
}

app.get("/", (req, res) => res.json({ ok: true, message: "SAUDI JOB API running" }));
app.get("/api/meta", (req, res) => res.json({ cities: CITIES, roles: ROLES }));

// JOB LIST: urgent first, then newest. Auto-expiry 15 days
app.get("/api/jobs", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
  const skip = Math.max(parseInt(req.query.skip || "0", 10), 0);

  const now = Date.now();
  const expiryDays = 15;
  const minCreatedAt = new Date(now - expiryDays * 24 * 60 * 60 * 1000);

  const total = await Job.countDocuments({ createdAt: { $gte: minCreatedAt } });

  const raw = await Job.find({ createdAt: { $gte: minCreatedAt } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const items = raw
    .map((j) => {
      const urgentActive = !!(j.isUrgent && j.urgentUntil && new Date(j.urgentUntil).getTime() > now);
      return { ...j, urgentActive, isUrgent: urgentActive ? true : false };
    })
    .sort((a, b) => {
      if (a.urgentActive && !b.urgentActive) return -1;
      if (!a.urgentActive && b.urgentActive) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  res.json({ items, total });
});

// GET job by id (for openJob=)
app.get("/api/jobs/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

  const job = await Job.findById(id).lean();
  if (!job) return res.status(404).json({ message: "Not found" });

  const now = Date.now();
  const urgentActive = !!(job.isUrgent && job.urgentUntil && new Date(job.urgentUntil).getTime() > now);
  res.json({ ...job, urgentActive, isUrgent: urgentActive ? true : false });
});

// Create job + push to role subscribers
app.post("/api/jobs", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  const data = parsed.data;
  const now = new Date();
  const urgentUntil = data.isUrgent ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null;

  const jobRoleNorm = normalizeRole(data.jobRole);

  const savedJob = await Job.create({
    name: data.name,
    companyName: (data.companyName || "").trim() ? data.companyName : data.name,
    phone: data.phone,
    email: String(data.email).trim().toLowerCase(),
    city: data.city,
    jobRole: jobRoleNorm,
    description: data.description,
    isUrgent: !!data.isUrgent,
    urgentUntil,
    views: 0
  });

  // Send push
  try {
    const tokensDB = await PushToken.find({ roles: jobRoleNorm }).lean();
    const tokens = (tokensDB || []).map((t) => t.token).filter(Boolean);

    if (tokens.length) {
      const url = `${process.env.FRONTEND_URL || ""}/?openJob=${savedJob._id}`;
      const resp = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `New Job: ${savedJob.jobRole}`,
          body: `${savedJob.city} • Tap to open`
        },
        data: {
          type: "job",
          jobId: String(savedJob._id),
          url
        }
      });

      // remove bad tokens
      const bad = [];
      resp.responses.forEach((r, i) => {
        if (!r.success) bad.push(tokens[i]);
      });
      if (bad.length) await PushToken.deleteMany({ token: { $in: bad } });
    }
  } catch (e) {
    console.log("Push send error:", e?.message || e);
  }

  res.status(201).json(savedJob);
});

// View counter
app.post("/api/jobs/:id/view", async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });
  await Job.findByIdAndUpdate(id, { $inc: { views: 1 } });
  res.json({ ok: true });
});

// Update job (email verify)
app.put("/api/jobs/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

  const email = String(req.query.email || "").trim().toLowerCase();
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.email.toLowerCase() !== email) return res.status(403).json({ message: "Email does not match" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });

  const patch = parsed.data;
  const now = new Date();

  if (patch.isUrgent === true) {
    job.isUrgent = true;
    job.urgentUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (patch.isUrgent === false) {
    job.isUrgent = false;
    job.urgentUntil = null;
  }

  if (typeof patch.name === "string") job.name = patch.name;
  if (typeof patch.companyName === "string") job.companyName = patch.companyName.trim() ? patch.companyName : job.companyName;
  if (typeof patch.phone === "string") job.phone = patch.phone;
  if (typeof patch.city === "string") job.city = patch.city;
  if (typeof patch.jobRole === "string") job.jobRole = normalizeRole(patch.jobRole);
  if (typeof patch.description === "string") job.description = patch.description;

  await job.save();
  res.json(job.toObject());
});

// Delete job (email verify)
app.delete("/api/jobs/:id", async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid id" });

  const email = String(req.query.email || "").trim().toLowerCase();
  const job = await Job.findById(id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.email.toLowerCase() !== email) return res.status(403).json({ message: "Email does not match" });

  await job.deleteOne();
  res.json({ ok: true });
});

// My posts
app.get("/api/my-posts", async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "email required" });

  const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
  const skip = Math.max(parseInt(req.query.skip || "0", 10), 0);

  const items = await Job.find({ email })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({ items, total: items.length });
});

// NEWS (simple fetch from your existing source)
app.get("/api/news", async (req, res) => {
  try {
    // This keeps it simple: you already had working news in your current backend.
    // Replace URL if you want. Right now using Saudi Gazette RSS format simple.
    const rssUrl = "https://saudigazette.com.sa/rss.xml";
    const r = await fetch(rssUrl);
    const xml = await r.text();

    // Very small XML parse (no extra dependency): extract first few items
    const items = [];
    const itemBlocks = xml.split("<item>").slice(1, 6);
    for (const block of itemBlocks) {
      const title = (block.split("<title>")[1] || "").split("</title>")[0]?.trim();
      const link = (block.split("<link>")[1] || "").split("</link>")[0]?.trim();
      const pubDate = (block.split("<pubDate>")[1] || "").split("</pubDate>")[0]?.trim();
      const desc = (block.split("<description>")[1] || "").split("</description>")[0]?.replace(/<!\[CDATA\[|\]\]>/g, "")?.trim();

      if (title && link) {
        items.push({
          _id: link,
          title,
          link,
          summary: desc || "",
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          source: "Saudi Gazette"
        });
      }
    }

    res.json({ items });
  } catch (e) {
    res.json({ items: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running:", PORT));
