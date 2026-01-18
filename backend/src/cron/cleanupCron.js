import cron from "node-cron";
import Job from "../models/Job.js";

export function startCleanupCron() {
  // Every 1 hour
  cron.schedule("0 * * * *", async () => {
    try {
      // mark expired jobs as deleted (optional)
      const now = new Date();
      await Job.updateMany({ expiresAt: { $lte: now } }, { $set: { deleted: true } });
      console.log("🧹 Cleanup: expired jobs marked deleted");
    } catch (e) {
      console.log("⚠️ Cleanup error:", e?.message || e);
    }
  });
}
