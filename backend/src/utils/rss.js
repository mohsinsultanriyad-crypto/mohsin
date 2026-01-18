import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000
});

export async function fetchRssItems(url) {
  const feed = await parser.parseURL(url);
  const source = feed?.title || url;

  const items = (feed?.items || []).map((it) => ({
    title: it.title || "",
    link: it.link || "",
    publishedAt: it.isoDate ? new Date(it.isoDate) : new Date(),
    summary: it.contentSnippet || it.content || "",
    source
  }));

  return items.filter((x) => x.title && x.link);
}

export function isImportantNews(item) {
  const t = (item.title || "").toLowerCase();
  const keywords = ["labour", "labor", "iqama", "work", "salary", "visa", "saudi", "ministry", "fine", "rule", "regulation"];
  return keywords.some((k) => t.includes(k));
}
