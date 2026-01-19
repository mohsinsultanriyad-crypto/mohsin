import express from "express";
import { Token } from "../models/Token.js";
import { tokenUpsertSchema } from "../utils/validate.js";
import { uniq } from "../utils/sanitize.js";

const router = express.Router();

/**
 * POST /api/tokens
 * Save/Update FCM token with roles + newsEnabled
 */
router.post("/", async (req, res, next) => {
  try {
    const parsed = tokenUpsertSchema.parse(req.body);

    const token = String(parsed.token).trim();
    const roles = uniq(parsed.roles);
    const newsEnabled = !!parsed.newsEnabled;

    await Token.updateOne(
      { token },
      { $set: { roles, newsEnabled, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (e) {
    if (e?.name === "ZodError") {
      return res.status(400).json({ ok: false, message: "Invalid data", issues: e.issues });
    }
    next(e);
  }
});

/**
 * GET /api/tokens/stats (optional)
 */
router.get("/stats", async (req, res, next) => {
  try {
    const total = await Token.countDocuments();
    const newsOn = await Token.countDocuments({ newsEnabled: true });
    res.json({ ok: true, total, newsOn });
  } catch (e) {
    next(e);
  }
});

export default router;
