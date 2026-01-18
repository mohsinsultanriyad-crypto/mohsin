import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Sheet from "../components/Sheet";

export default function Updates() {
  const [news, setNews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [params] = useSearchParams();
  const openLink = useMemo(() => params.get("open") || "", [params]);

  async function load() {
    const n = await api.getNews().catch(() => []);
    setNews(n || []);

    if (!n || n.length === 0) {
      const j = await api.getJobs().catch(() => []);
      setJobs((j || []).slice(0, 5));
    } else {
      setJobs([]);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!openLink) return;
    // auto open article if present
    const item = news.find((x) => x.link === openLink);
    if (item) {
      setSelected(item);
      setOpen(true);
    } else if (openLink) {
      // if not loaded yet, open directly
      window.open(openLink, "_blank");
    }
  }, [openLink, news]);

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="mb-3 text-xl font-bold text-blue-700">Updates</div>

      {news.length > 0 ? (
        <div className="space-y-3">
          {news.map((n) => (
            <div
              key={n._id || n.link}
              onClick={() => { setSelected(n); setOpen(true); }}
              className="cursor-pointer rounded-2xl border bg-white p-4 shadow-sm active:scale-[0.99]"
            >
              <div className="text-sm text-gray-500">{n.source || "Saudi News"}</div>
              <div className="mt-1 text-base font-semibold text-blue-700">{n.title}</div>
              <div className="mt-2 line-clamp-2 text-sm text-gray-700">{n.summary || ""}</div>
              <div className="mt-3 text-xs text-gray-400">
                {n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
            News not available. Showing latest jobs.
          </div>
          {jobs.map((j) => (
            <div key={j._id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-lg font-semibold">{j.jobRole}</div>
              <div className="text-sm text-gray-500">{j.city}</div>
              <div className="mt-2 line-clamp-2 text-sm text-gray-700">{j.description}</div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={selected ? "Saudi Labour News" : "News"}>
        {selected && (
          <div className="space-y-3">
            <div className="text-base font-semibold">{selected.title}</div>
            <div className="text-sm text-gray-700">{selected.summary || ""}</div>
            <button
              onClick={() => window.open(selected.link, "_blank")}
              className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white"
            >
              Read Full Article
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
