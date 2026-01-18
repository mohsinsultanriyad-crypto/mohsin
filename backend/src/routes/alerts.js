import express from "express";
import Token from "../models/Token.js";
import Job from "../models/Job.js";

const router = express.Router();

function activeJobFilter() {
  return { deleted: false, expiresAt: { $gt: new Date() } };
}

// POST /api/alerts/register
router.post("/register", async (req, res) => {
  const { token, roles = [], newsEnabled = true } = req.body || {};
  if (!token) return res.status(400).json({ error: "token required" });

  const cleanRoles = Array.isArray(roles) ? roles.map(String).filter(Boolean) : [];

  await Token.updateOne(
    { token },
    { $set: { roles: cleanRoles, newsEnabled: !!newsEnabled, updatedAt: new Date() } },
    { upsert: true }
  );

  res.json({ ok: true });
});

// GET /api/alerts/jobs?token=...
router.get("/jobs", async (req, res) => {
  const token = String(req.query.token || "");
  if (!token) return res.status(400).json({ error: "token required" });

  const user = await Token.findOne({ token }).lean();
  if (!user) return res.json([]);

  const roles = user.roles || [];
  if (!roles.length) return res.json([]);

  const jobs = await Job.find({ ...activeJobFilter(), jobRole: { $in: roles } })
    .sort({ urgentUntil: -1, createdAt: -1 })
    .lean();

  res.json(jobs);
});

// GET /api/alerts/badge?token=...
router.get("/badge", async (req, res) => {
  const token = String(req.query.token || "");
  if (!token) return res.status(400).json({ error: "token required" });

  const user = await Token.findOne({ token }).lean();
  res.json({ badgeCount: user?.badgeCount || 0 });
});

// POST /api/alerts/reset-badge
router.post("/reset-badge", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "token required" });

  await Token.updateOne({ token }, { $set: { badgeCount: 0, updatedAt: new Date() } });
  res.json({ ok: true });
});

export default router;
