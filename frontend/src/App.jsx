
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import BottomNav from "./components/BottomNav";

import AllJobs from "./pages/AllJobs";
import PostJob from "./pages/PostJob";
import Alerts from "./pages/Alerts";
import MyPosts from "./pages/MyPosts";
import Updates from "./pages/Updates";

import { api } from "./services/api";
import { getSavedFcmToken, refreshTokenOnLoad, listenForegroundMessages } from "./services/fcm";

export default function App() {
  const [badgeCount, setBadgeCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const fcmToken = useMemo(() => getSavedFcmToken(), []);

  async function loadBadge() {
    const token = getSavedFcmToken();
    if (!token) {
      setBadgeCount(0);
      return;
    }
    try {
      const r = await api.getBadge(token);
      setBadgeCount(r?.badgeCount || 0);
    } catch {
      setBadgeCount(0);
    }
  }

  useEffect(() => {
    refreshTokenOnLoad();
    loadBadge();

    listenForegroundMessages({
      onNavigate: (target) => {
        if (target === "alerts") navigate("/alerts");
        if (target === "updates") navigate("/updates");
        loadBadge();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadBadge(); }, [location.pathname, fcmToken]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-white pb-24">
      <Routes>
        <Route path="/" element={<AllJobs />} />
        <Route path="/post" element={<PostJob />} />
        <Route path="/alerts" element={<Alerts onBadgeReset={loadBadge} />} />
        <Route path="/myposts" element={<MyPosts />} />
        <Route path="/updates" element={<Updates />} />
      </Routes>

      <BottomNav badgeCount={badgeCount} />
    </div>
  );
}
