import cron from "node-cron";
import { fetchAndStoreNews, pickImportantUnnotifiedNews } from "../services/newsFetcher.js";
import { Token } from "../models/Token.js";
import { isFirebaseReady, sendPushToTokens } from "../services/fcm.js";
import { News } from "../models/News.js";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

let dailyCount = { key: todayKey(), count: 0 };

function maxPerDay() {
  const n = Number(process.env.NEWS_MAX_NOTIFICATIONS_PER_DAY || "4");
  return Number.isFinite(n) ? n : 4;
}

async function maybeSendNewsPush() {
  // reset daily counter if date changed
  const k = todayKey();
  if (dailyCount.key !== k) dailyCount = { key: k, count: 0 };

  if (!isFirebaseReady()) return;

  if (dailyCount.count >= maxPerDay()) return;

  const news = await pickImportantUnnotifiedNews();
  if (!news) return;

  // only send to users who enabled news
  const tokensDocs = await Token.find({ newsEnabled: true }).lean();
  const tokens = tokensDocs.map((t) => t.token);

  const payload = {
    title: "Saudi Labour News",
    body: "New rule announced • Tap to read",
    data: {
      type: "news",
      targetTab: "updates",
      link: news.link
    }
  };

  const res = await sendPushToTokens(tokens, payload);

  // mark as notified (even if partial fail, still prevent spam)
  await News.updateOne({ _id: news._id }, { $set: { notifiedAt: new Date() } });

  dailyCount.count += 1;

  console.log("🔔 News push:", {
    ok: res.ok,
    success: res.successCount,
    fail: res.failureCount
  });
}

export function startNewsCron() {
  const expr = process.env.NEWS_CRON || "*/30 * * * *";
  console.log("🕒 News cron:", expr);

  // run on start once
  runCycle().catch(() => {});

  cron.schedule(expr, () => {
    runCycle().catch(() => {});
  });
}

async function runCycle() {
  const { saved } = await fetchAndStoreNews();
  console.log("📰 News fetch saved:", saved);

  await maybeSendNewsPush();
}
