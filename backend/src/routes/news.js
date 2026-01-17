import express from "express";
import News from "../models/News.js";

const router = express.Router();

router.get("/", async (req,res)=>{
  const items = await News.find().sort({publishedAt:-1}).limit(20);
  res.json({items});
});

export default router;
