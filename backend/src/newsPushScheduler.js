import PushToken from "./models/PushToken.js";
import NewsPushLog from "./models/NewsPushLog.js";
import { getLatestNews, fetchAndStoreNews } from "./newsService.js";

function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function startNewsScheduler(admin) {
  const MAX_PER_DAY = parseInt(process.env.NEWS_PUSH_MAX_PER_DAY || "4", 10);
  const MIN_GAP_MIN = parseInt(process.env.NEWS_PUSH_MIN_GAP_MIN || String(2 * 60), 10); // 2 hours

  // 1) refresh news every 30 mins
  setInterval(async () => {
    try {
      const r = await fetchAndStoreNews();
      if (r.inserted) console.log("[NEWS] inserted:", r.inserted);
    } catch (e) {
      console.log("[NEWS] refresh error:", e?.message || e);
    }
  }, 30 * 60 * 1000);

  // 2) attempt push every 20 mins (but per-user rules block extra)
  setInterval(async () => {
    try {
      // pick latest news pool (last 48 hours)
      const pool = await getLatestNews(20);
      const now = new Date();
      const fresh = pool.filter((n) => now - new Date(n.publishedAt) < 48 * 60 * 60 * 1000);
      if (!fresh.length) return;

      // users who enabled news alerts
      const tokensDB = await PushToken.find({ newsEnabled: true }).lean();
      if (!tokensDB.length) return;

      // choose a random news item
      const picked = fresh[randInt(0, fresh.length - 1)];

      const dk = dayKey(now);

      // send one-by-one to respect limits
      for (const row of tokensDB) {
        const token = row.token;
        if (!token) continue;

        const log = await NewsPushLog.findOne({ token, dayKey: dk }).lean();

        const count = log?.count || 0;
        const lastSentAt = log?.lastSentAt ? new Date(log.lastSentAt) : null;

        if (count >= MAX_PER_DAY) continue;

        if (lastSentAt) {
          const diffMin = (now - lastSentAt) / (60 * 1000);
          if (diffMin < MIN_GAP_MIN) continue;
        }

        // send
        try {
          await admin.messaging().send({
            token,
            notification: {
              title: "Saudi Labour Update",
              body: picked.title.slice(0, 120)
            },
            data: {
              type: "news",
              link: picked.link,
              title: picked.title
            }
          });

          await NewsPushLog.updateOne(
            { token, dayKey: dk },
            {
              $set: { lastSentAt: now },
              $inc: { count: 1 }
            },
            { upsert: true }
          );
        } catch (e) {
          const msg = e?.message || String(e);
          console.log("[NEWS] push error:", msg);

          // remove bad tokens
          if (msg.includes("registration-token-not-registered") || msg.includes("Requested entity was not found")) {
            await PushToken.deleteOne({ token });
            await NewsPushLog.deleteMany({ token });
          }
        }
      }
    } catch (e) {
      console.log("[NEWS] scheduler error:", e?.message || e);
    }
  }, 20 * 60 * 1000);

  console.log("[NEWS] scheduler started");
}
