import express from "express";
import cors from "cors";
import jobsRoute from "./routes/jobs.js";
import pushRoute from "./routes/push.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/jobs", jobsRoute);
app.use("/api/push", pushRoute);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
