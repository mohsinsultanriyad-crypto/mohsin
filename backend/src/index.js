import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import jobsRoutes from "./routes/jobs.js";
import newsRoutes from "./routes/news.js";
import pushRoutes from "./routes/push.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.get("/", (req,res)=> {
  res.send("SAUDI JOB Backend Running");
});

app.use("/api/jobs", jobsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/push", pushRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));
