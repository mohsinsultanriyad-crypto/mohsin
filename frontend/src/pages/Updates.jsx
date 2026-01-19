import { useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import Empty from "../components/Empty.jsx";
import ModalSheet from "../components/ModalSheet.jsx";
import NewsCard from "../components/NewsCard.jsx";
import JobCard from "../components/JobCard.jsx";
import { fetchNews } from "../services/newsApi.js";
import { fetchJobs, viewJob } from "../services/jobsApi.js";
import { getSavedJobs } from "../lib/storage.js"; // ✅ NEW
import { useLocation } from "react-router-dom"; // ✅ NEW

export default function Updates() {
  const loc = useLocation(); // ✅ NEW

  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [jobsFallback, setJobsFallback] = useState([]);

  const [savedJobs, setSavedJobs] = useState([]); // ✅ NEW

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  async function load() {
    setLoading(true);
    try {
      // ✅ ONLY 5 NEWS
      const list = await fetchNews(5);
      setNews(list);

      // ✅ Saved jobs block (max 5)
      const savedIds = getSavedJobs();
      if (savedIds.length) {
        const jobs = await fetchJobs();
        const saved = jobs
          .filter((j) => savedIds.includes(String(j._id)))
          .slice(0, 5);
        setSavedJobs(saved);
      } else {
        setSavedJobs([]);
      }

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

  // ✅ If opened from notification: /updates?jobId=xxx OR ?link=...
  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(loc.search);
    const jobId = params.get("jobId");
    const link = params.get("link");

    // Open job modal if jobId found in saved/fallback lists
    if (jobId) {
      const all = [...savedJobs, ...jobsFallback];
      const found = all.find((j) => String(j._id) === String(jobId));
      if (found) openJob(found);
    }

    // Open news modal if link matches
    if (link && news.length) {
      const found = news.find((n) => String(n.link) === String(link));
      if (found) openNews(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loc.search]);

  return (
    <div>
      <div className="mb-3">
        <div className="text-lg font-bold text-gray-900">Updates</div>
        <div className="mt-1 text-sm text-gray-500">Saudi labour news</div>
      </div>

      {loading ? <Loading /> : null}

      {!loading && news.length === 0 && jobsFallback.length === 0 && savedJobs.length === 0 ? (
        <Empty title="No updates yet" desc="News will appear here." />
      ) : null}

      {/* ✅ NEWS */}
      {!loading && news.length > 0 ? (
        <div className="space-y-3">
          {news.slice(0, 5).map((n) => (
            <NewsCard key={n._id || n.link} item={n} onOpen={() => openNews(n)} />
          ))}
        </div>
      ) : null}

      {/* ✅ SAVED JOBS */}
      {!loading && savedJobs.length > 0 ? (
        <div className="mt-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900">Saved Jobs</div>
          {savedJobs.slice(0, 5).map((j) => (
            <JobCard key={j._id} job={j} onOpen={() => openJob(j)} />
          ))}
        </div>
      ) : null}

      {/* ✅ FALLBACK JOBS (only if no news) */}
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
