import express from "express";
import { getLatestNews } from "../services/newsFetcher.js";

const router = express.Router();

/**
 * GET /api/news
 */
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 30), 60);
    const news = await getLatestNews(limit);
    res.json({ ok: true, news });
  } catch (e) {
    next(e);
  }
});

export default router;
