import express from "express";
import PushToken from "../models/PushToken.js";

const router = express.Router();

/*
POST /api/push/register
body: { token, roles[], newsEnabled }
*/
router.post("/register", async (req, res) => {
  try {
    const token = String(req.body.token || "").trim();
    const roles = Array.isArray(req.body.roles) ? req.body.roles : [];
    const newsEnabled = !!req.body.newsEnabled;

    if (!token) return res.status(400).json({ message: "token required" });

    await PushToken.updateOne(
      { token },
      {
        $set: {
          token,
          roles: roles.map(r => String(r).toLowerCase()),
          newsEnabled,
          lastSeen: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (e) {
    console.log("Push register error:", e);
    res.status(500).json({ message: "error" });
  }
});

// Debug tokens
router.get("/debug", async (req, res) => {
  const count = await PushToken.countDocuments();
  const sample = await PushToken.find().limit(5);
  res.json({ count, sample });
});

export default router;
