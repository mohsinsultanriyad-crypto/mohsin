import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import jobsRoutes from "./routes/jobs.routes.js";
import tokensRoutes from "./routes/tokens.routes.js";
import newsRoutes from "./routes/news.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));

  const origin = process.env.CLIENT_ORIGIN || "*";
  app.use(
    cors({
      origin: origin === "*" ? "*" : [origin],
      credentials: false
    })
  );

  app.use(morgan("tiny"));

  app.get("/", (req, res) => {
    res.json({ ok: true, name: "saudi-job-backend", version: "1.3.0" });
  });

  app.use("/api/jobs", jobsRoutes);
  app.use("/api/tokens", tokensRoutes);
  app.use("/api/news", newsRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({ ok: false, message: "Not found" });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  });

  return app;
}
