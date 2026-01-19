import Parser from "rss-parser";
import { News } from "../models/News.js";
import { normLower } from "../utils/sanitize.js";

const parser = new Parser({
  timeout: 15000
});

function parseUrls() {
  const raw = process.env.NEWS_RSS_URLS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function importantKeywords() {
  const raw = process.env.NEWS_IMPORTANT_KEYWORDS || "";
  return raw
    .split(",")
    .map((s) => normLower(s))
    .filter(Boolean);
}

function isImportant(title = "", snippet = "") {
  const keys = importantKeywords();
  if (!keys.length) return true;
  const text = normLower(title + " " + snippet);
  return keys.some((k) => text.includes(k));
}

function pickImage(item) {
  // best-effort for RSS
  const enclosures = item.enclosure?.url ? item.enclosure.url : "";
  const media = item["media:content"]?.url || "";
  const thumb = item["media:thumbnail"]?.url || "";
  return enclosures || media || thumb || "";
}

export async function fetchAndStoreNews() {
  const urls = parseUrls();
  if (!urls.length) {
    console.log("⚠️ No NEWS_RSS_URLS set. Skipping news fetch.");
    return { saved: 0 };
  }

  let saved = 0;

  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url);
      const source = feed?.title || url;

      for (const item of feed.items.slice(0, 20)) {
        const title = (item.title || "").trim();
        const link = (item.link || "").trim();
        if (!title || !link) continue;

        const snippet = (item.contentSnippet || item.content || "").toString().slice(0, 300);
        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();
        const image = pickImage(item);

        const doc = {
          title,
          link,
          source,
          snippet,
          publishedAt,
          image
        };

        const res = await News.updateOne(
          { link },
          { $setOnInsert: doc },
          { upsert: true }
        );

        if (res.upsertedCount === 1) saved += 1;
      }
    } catch (e) {
      console.log("❌ RSS fetch failed:", url, e?.message || e);
    }
  }

  return { saved };
}

export async function getLatestNews(limit = 30) {
  const news = await News.find({})
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

  return news;
}

export async function pickImportantUnnotifiedNews() {
  // find newest item that is important and not notified yet
  const latest = await News.find({ notifiedAt: null })
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  const picked = latest.find((n) => isImportant(n.title, n.snippet));
  return picked || null;
}
