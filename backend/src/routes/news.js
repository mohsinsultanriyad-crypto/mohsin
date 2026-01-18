import express from "express";
import News from "../models/News.js";

const router = express.Router();

// GET /api/news
router.get("/", async (req, res) => {
  const items = await News.find({}).sort({ publishedAt: -1 }).limit(40).lean();
  res.json(items);
});

export default router;
