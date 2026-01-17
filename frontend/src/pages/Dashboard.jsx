import { useEffect, useState } from "react";
import JobCard from "../components/JobCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";
import EditModal from "../components/EditModal.jsx";
import { deleteJob, getNews, myPosts, updateJob } from "../services/api.js";

export default function Dashboard() {
  const [email, setEmail] = useState(() => localStorage.getItem("sj_owner_email") || "");
  const [posts, setPosts] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const [selected, setSelected] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  async function loadMyPosts() {
    if (!email) return;
    const data = await myPosts(email);
    setPosts(data.items || []);
  }

  async function loadNews() {
    try {
      setLoadingNews(true);
      const data = await getNews();
      setNews(data.items || []);
    } finally {
      setLoadingNews(false);
    }
  }

  useEffect(() => { loadNews(); }, []);

  function openJob(job) {
    setSelected(job);
    setOpenDetails(true);
  }

  async function doDelete(job) {
    if (!email) return alert("Enter your email first");
    if (!confirm("Delete this job?")) return;
    try {
      await deleteJob(job._id, email);
      await loadMyPosts();
      alert("Deleted");
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  async function doSaveEdit(patch) {
    if (!email) return alert("Enter your email first");
    try {
      await updateJob(selected._id, email, patch);
      setEditOpen(false);
      await loadMyPosts();
      alert("Updated");
    } catch (e) {
      alert(e.message || "Update failed");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-24">
      <div className="text-3xl font-extrabold">Dashboard</div>

      <div className="mt-4 bg-gray-50 border rounded-2xl p-4">
        <div className="text-xs font-extrabold text-gray-300 tracking-widest">
          MY POSTS (EMAIL VERIFY)
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 h-11 border rounded-2xl px-4 font-semibold"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button
            onClick={() => { localStorage.setItem("sj_owner_email", email); loadMyPosts(); }}
            className="h-11 px-4 rounded-2xl bg-black text-white font-extrabold"
          >
            Load
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {posts.map((j) => (
            <div key={j._id} className="space-y-2">
              <JobCard job={j} onOpen={openJob} />
              <div className="flex gap-2">
                <button
                  onClick={() => { setSelected(j); setEditOpen(true); }}
                  className="flex-1 h-11 rounded-2xl bg-gray-900 text-white font-extrabold"
                >
                  Edit
                </button>
                <button
                  onClick={() => doDelete(j)}
                  className="flex-1 h-11 rounded-2xl bg-red-600 text-white font-extrabold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {email && posts.length === 0 && (
            <div className="text-gray-400 font-extrabold mt-2">No posts found.</div>
          )}
        </div>
      </div>

      <div className="mt-5 bg-gray-50 border rounded-2xl p-4">
        <div className="text-xs font-extrabold text-gray-300 tracking-widest">
          LABOUR NEWS
        </div>

        {loadingNews && <div className="mt-3 text-gray-500 font-semibold">Loading news...</div>}
        {!loadingNews && news.length === 0 && <div className="mt-3 text-gray-400 font-semibold">No news.</div>}

        <div className="mt-3 space-y-3">
          {news.map((n) => (
            <a
              key={n._id}
              href={n.link}
              target="_blank"
              rel="noreferrer"
              className="block bg-white border rounded-2xl p-4"
            >
              <div className="font-extrabold text-gray-800">{n.title}</div>
              <div className="mt-2 text-sm text-gray-500 font-semibold">
                {n.summary}
              </div>
            </a>
          ))}
        </div>
      </div>

      <DetailsModal open={openDetails} job={selected} onClose={() => setOpenDetails(false)} />

      <EditModal
        open={editOpen}
        job={selected}
        onClose={() => setEditOpen(false)}
        onSave={doSaveEdit}
      />
    </div>
  );
}
