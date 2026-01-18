import cron from "node-cron";
import News from "../models/News.js";
import Token from "../models/Token.js";
import { fetchRssItems, isImportantNews } from "../utils/rss.js";
import { buildNewsPush, incrementBadgeForTokens, sendPushToTokens } from "../utils/push.js";

let sentToday = 0;
let lastDayKey = "";

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function startNewsCron(RSS_URLS = [], LIMIT_PER_DAY = 4) {
  // Every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    try {
      const dk = dayKey();
      if (dk !== lastDayKey) {
        lastDayKey = dk;
        sentToday = 0;
      }

      if (!RSS_URLS.length) return;

      for (const url of RSS_URLS) {
        const items = await fetchRssItems(url);

        for (const it of items.slice(0, 8)) {
          // upsert by link
          const exists = await News.findOne({ link: it.link }).lean();
          if (exists) continue;

          const important = isImportantNews(it);

          const saved = await News.create({
            title: it.title,
            link: it.link,
            source: it.source,
            publishedAt: it.publishedAt,
            summary: (it.summary || "").slice(0, 500),
            important
          });

          // Push only important & limited per day
          if (important && sentToday < LIMIT_PER_DAY) {
            const tokenDocs = await Token.find({ newsEnabled: true }).lean();
            const tokens = tokenDocs.map((t) => t.token);

            await incrementBadgeForTokens(tokens);
            await sendPushToTokens(tokens, buildNewsPush(saved));

            sentToday += 1;
            console.log("📰 News push sent:", saved.title);
          }
        }
      }

      console.log("✅ News cron finished");
    } catch (e) {
      console.log("⚠️ News cron error:", e?.message || e);
    }
  });
}
