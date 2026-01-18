import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import { initFirebase } from "./firebase.js";

import jobsRoutes from "./routes/jobs.js";
import alertsRoutes from "./routes/alerts.js";
import newsRoutes from "./routes/news.js";

import { startNewsCron } from "./cron/newsCron.js";
import { startCleanupCron } from "./cron/cleanupCron.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "1mb" }));

const FRONTEND_URL = process.env.FRONTEND_URL || "*";
app.use(
  cors({
    origin: FRONTEND_URL === "*" ? true : FRONTEND_URL,
    credentials: true
  })
);

app.get("/", (req, res) => res.send("SAUDI JOB Backend v1.3 ✅"));

app.use("/api/jobs", jobsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/news", newsRoutes);

const PORT = process.env.PORT || 3000;

async function boot() {
  await connectDB(process.env.MONGO_URL);
  initFirebase(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  // cron
  const rssUrls = String(process.env.RSS_URLS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const limit = Number(process.env.NEWS_PUSH_LIMIT_PER_DAY || 4);

  startCleanupCron();
  startNewsCron(rssUrls, limit);

  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
}

boot().catch((e) => {
  console.error("❌ Boot error:", e);
  process.exit(1);
});
