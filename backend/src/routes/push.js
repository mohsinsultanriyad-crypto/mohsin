import express from "express";
const router = express.Router();

router.post("/register", (req, res) => {
  console.log("Push token saved:", req.body);
  res.json({ ok: true });
});

router.post("/test", (req, res) => {
  res.json({ ok: true });
});

export default router;
