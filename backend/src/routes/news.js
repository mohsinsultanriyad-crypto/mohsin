import express from "express";
import News from "../models/News.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await News.find().sort({ publishedAt: -1 }).limit(30);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ items: [], error: "NEWS_FETCH_FAILED" });
  }
});

export default router;
