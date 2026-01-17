import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db.js";
import Job from "./models/Job.js";
import PushToken from "./models/PushToken.js";
import pushRoutes from "./routes/push.js";
import { initFirebaseAdmin } from "./firebaseAdmin.js";

// 🔹 News imports
import NewsItem from "./models/NewsItem.js";
import { fetchAndStoreNews, getLatestNews } from "./newsService.js";
import { startNewsScheduler } from "./newsPushScheduler.js";

const admin = initFirebaseAdmin();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/push", pushRoutes);

await connectDB();

// ============ SETTINGS ============
const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
const URGENT_HOURS = 24 * 60 * 60 * 1000;

// ============ HOME JOB FEED ============
app.get("/api/jobs", async (req, res) => {
  const fromDate = new Date(Date.now() - FIFTEEN_DAYS);

  const jobs = await Job.find({
    createdAt: { $gte: fromDate }
  }).sort({
    urgentUntil: -1,
    createdAt: -1
  });

  res.json({ items: jobs });
});

// ============ CREATE JOB + PUSH ============
app.post("/api/jobs", async (req, res) => {
  try {
    const now = new Date();
    const urgentUntil = req.body.isUrgent
      ? new Date(now.getTime() + URGENT_HOURS)
      : null;

    const job = await Job.create({
      ...req.body,
      createdAt: now,
      updatedAt: now,
      urgentUntil
    });

    // 🔔 Role based push
    const role = String(job.jobRole || "").toLowerCase();
    const tokensDB = await PushToken.find({ roles: role });
    const tokens = tokensDB.map(t => t.token);

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: "New Job: " + job.jobRole,
          body: job.city + " • Tap to open"
        }
      });
    }

    res.json(job);
  } catch (e) {
    console.log("Create job error:", e);
    res.status(500).json({ message: "error" });
  }
});

// ============ DELETE JOB ============
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const email = String(req.query.email || "").toLowerCase();
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Not found" });

    if (job.email.toLowerCase() !== email)
      return res.status(403).json({ message: "Email mismatch" });

    await job.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.log("Delete error:", e);
    res.status(500).json({ message: "error" });
  }
});

// ============ NEWS API ============
app.get("/api/news", async (req, res) => {
  const limit = parseInt(req.query.limit || "10", 10);
  const items = await getLatestNews(limit);
  res.json({ items });
});

// ============ INITIAL NEWS FETCH ============
fetchAndStoreNews().catch(() => {});

// ============ START NEWS PUSH SCHEDULER ============
startNewsScheduler(admin);

// ============ ROOT ============
app.get("/", (req, res) => {
  res.json({ ok: true, message: "SAUDI JOB API Running" });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
