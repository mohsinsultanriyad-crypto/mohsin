import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./db.js";
import { startNewsCron } from "./cron/news.cron.js";
import { initFirebaseAdmin } from "./services/fcm.js";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await connectDB(process.env.MONGODB_URI);

  // Firebase Admin init (for sending push)
  initFirebaseAdmin();

  // Start Cron
  startNewsCron();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error("❌ Failed to start:", e);
  process.exit(1);
});
