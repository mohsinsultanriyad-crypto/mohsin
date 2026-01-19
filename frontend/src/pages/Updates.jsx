import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import NewsCard from "../components/NewsCard.jsx";
import JobCard from "../components/JobCard.jsx";
import { fetchNews } from "../services/newsApi.js";
import { fetchJobs, viewJob } from "../services/jobsApi.js";

export default function Updates() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [jobsFallback, setJobsFallback] = useState([]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  async function load() {
    setLoading(true);
    try {
      // ✅ ONLY 5 NEWS
      const list = await fetchNews(5);
      setNews(list);

      if (!list.length) {
        const jobs = await fetchJobs();
        setJobsFallback(jobs.slice(0, 5)); // ✅ ONLY 5 JOBS FALLBACK
      } else {
        setJobsFallback([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNews(item) {
    setActive({ type: "news", item });
    setOpen(true);
  }

  async function openJob(job) {
    setActive({ type: "job", job });
    setOpen(true);
    try {
      await viewJob(job._id);
    } catch {}
  }

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Updates</div>
        <div className="mt-1 text-sm text-gray-500">Saudi labour news</div>
      </div>

      {loading ? <Loading /> : null}

      {!loading && news.length === 0 && jobsFallback.length === 0 ? (
        <Empty title="No updates yet" desc="News will appear here." />
      ) : null}

      {!loading && news.length > 0 ? (
        <div className="space-y-3">
          {/* ✅ double safety */}
          {news.slice(0, 5).map((n) => (
            <NewsCard key={n._id || n.link} item={n} onOpen={() => openNews(n)} />
          ))}
        </div>
      ) : null}

      {!loading && news.length === 0 && jobsFallback.length > 0 ? (
        <div className="mt-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900">Latest Jobs</div>
          {jobsFallback.slice(0, 5).map((j) => (
            <JobCard key={j._id} job={j} onOpen={() => openJob(j)} />
          ))}
        </div>
      ) : null}

      <ModalSheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          active?.type === "news"
            ? "News Summary"
            : active?.type === "job"
            ? `${active.job.jobRole} • ${active.job.city}`
            : "Details"
        }
      >
        {active?.type === "news" ? (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900">{active.item.title}</div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {active.item.snippet || "Open full article to read more."}
            </div>
            <a
              className="block w-full rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={active.item.link}
              target="_blank"
              rel="noreferrer"
            >
              Read Full Article
            </a>
          </div>
        ) : null}

        {active?.type === "job" ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">{active.job.description}</div>
            <a
              className="block w-full rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
              href={`https://wa.me/${String(active.job.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello, I want to apply for ${active.job.jobRole} in ${active.job.city}.`
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Apply on WhatsApp
            </a>
          </div>
        ) : null}
      </ModalSheet>
    </div>
  );
}
