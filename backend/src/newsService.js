import Parser from "rss-parser";
import NewsItem from "./models/NewsItem.js";

const parser = new Parser();

// Default feed: Saudi Gazette -> Saudi Arabia category
// Feed list page shows this feed id (74). :contentReference[oaicite:2]{index=2}
const DEFAULT_FEEDS = ["https://saudigazette.com.sa/rssFeed/74"];

// Labour keywords filter (English)
const KEYWORDS = [
  "labour", "labor", "work", "worker", "workers",
  "iqama", "salary", "wage", "saudization", "nitaqat",
  "recruitment", "employment", "work permit", "residency",
  "ministry of human resources", "hrsd", "mhrsd"
];

function textMatchLabour(title = "", summary = "") {
  const t = (title + " " + summary).toLowerCase();
  return KEYWORDS.some((k) => t.includes(k));
}

function cleanSummary(s = "") {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

export async function fetchAndStoreNews() {
  const feeds = process.env.NEWS_FEEDS
    ? process.env.NEWS_FEEDS.split(",").map((x) => x.trim()).filter(Boolean)
    : DEFAULT_FEEDS;

  let inserted = 0;

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        const title = String(item.title || "").trim();
        const link = String(item.link || "").trim();
        const summary = cleanSummary(item.contentSnippet || item.content || item.summary || "");
        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

        if (!title || !link) continue;
        if (!textMatchLabour(title, summary)) continue;

        // upsert by link
        const res = await NewsItem.updateOne(
          { link },
          {
            $setOnInsert: {
              source: feed.title || "News",
              title,
              link,
              summary,
              publishedAt
            }
          },
          { upsert: true }
        );

        if (res.upsertedCount === 1) inserted += 1;
      }
    } catch (e) {
      console.log("[NEWS] feed error:", feedUrl, e?.message || e);
    }
  }

  // keep DB clean: delete items older than 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NewsItem.deleteMany({ publishedAt: { $lt: cutoff } });

  return { inserted };
}

export async function getLatestNews(limit = 12) {
  return await NewsItem.find({})
    .sort({ publishedAt: -1 })
    .limit(Math.min(limit, 30))
    .lean();
}
