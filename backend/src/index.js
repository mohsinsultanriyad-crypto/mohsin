import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Job from "./models/Job.js";

const app = express();
app.use(cors());
app.use(express.json());

// Mongo Connect
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
});

// ============ JOB ROUTES ============ //

// Create Job
app.post("/api/jobs", async (req, res) => {
  try {
    const {
      name,
      companyName,
      phone,
      email,
      city,
      jobRole,
      description,
      urgent = false,
    } = req.body;

    if (!name || !phone || !email || !city || !jobRole || !description) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const job = await Job.create({
      name,
      companyName: companyName || "",
      phone,
      email,
      city,
      jobRole,
      description,
      urgent: !!urgent,
      urgentUntil: urgent ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      views: 0,
      createdAt: new Date(),
    });

    res.json(job);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// List Jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();

    const mapped = jobs.map((j) => ({
      ...j,
      urgentActive: j.urgentUntil ? new Date(j.urgentUntil) > now : false,
    }));

    // urgent first
    mapped.sort((a, b) => {
      const au = a.urgentActive ? 1 : 0;
      const bu = b.urgentActive ? 1 : 0;
      if (bu !== au) return bu - au;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(mapped);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Single Job  (IMPORTANT for Alerts sync)
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    const now = new Date();
    res.json({
      ...job,
      urgentActive: job.urgentUntil ? new Date(job.urgentUntil) > now : false,
    });
  } catch {
    res.status(404).json({ message: "Job not found" });
  }
});

// Increase Views
app.post("/api/jobs/:id/view", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Not found" });

    job.views = (job.views || 0) + 1;
    await job.save();
    res.json({ ok: true, views: job.views });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Job (Email verify)
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email required" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Not found" });

    if (job.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: "Email mismatch" });
    }

    await Job.deleteOne({ _id: job._id });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ============ START SERVER ============ //
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));
