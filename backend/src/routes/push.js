import express from "express";
import PushToken from "../models/PushToken.js";
import { initFirebaseAdmin } from "../firebaseAdmin.js";

const router = express.Router();
const admin = initFirebaseAdmin();

// POST /api/push/register
router.post("/register", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const roles = Array.isArray(req.body.roles) ? req.body.roles : [];
    const newsEnabled = !!req.body.newsEnabled;
    const platform = String(req.body.platform || "web");
    const userAgent = String(req.headers["user-agent"] || "");

    if (!token) return res.status(400).json({ message: "token required" });

    const normalizedRoles = roles
      .map((r) => String(r || "").trim().toLowerCase())
      .filter(Boolean);

    await PushToken.updateOne(
      { token },
      {
        $set: {
          token,
          roles: [...new Set(normalizedRoles)],
          newsEnabled,
          platform,
          userAgent,
          lastSeen: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ ok: true, saved: true, roles: [...new Set(normalizedRoles)], newsEnabled });
  } catch (e) {
    console.log("[PUSH] register error:", e?.message || e);
    res.status(500).json({ ok: false, message: "register failed" });
  }
});

// GET /api/push/debug
router.get("/debug", async (req, res) => {
  const count = await PushToken.countDocuments();
  const sample = await PushToken.find().sort({ lastSeen: -1 }).limit(5).lean();
  res.json({ count, sample });
});

// GET /api/push/test (send to latest token)
router.get("/test", async (req, res) => {
  try {
    const doc = await PushToken.findOne().sort({ lastSeen: -1 }).lean();
    if (!doc?.token) return res.status(404).json({ ok: false, message: "No token found" });

    const id = await admin.messaging().send({
      token: doc.token,
      notification: {
        title: "SAUDI JOB Test",
        body: "Test notification"
      },
      data: { type: "test", url: process.env.FRONTEND_URL || "/" }
    });

    res.json({ ok: true, messageId: id });
  } catch (e) {
    console.log("[PUSH] test error:", e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

export default router;
