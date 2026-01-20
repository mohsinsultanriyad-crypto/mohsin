import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function isToday(createdAt) {
  const t = new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= 24 * 60 * 60 * 1000; // last 24h
}

export default function CityTicker({ jobs = [] }) {
  const items = useMemo(() => {
    const map = new Map();

    for (const j of jobs) {
      const city = (j.city || "").trim();
      const createdAt = j.createdAt || j.created_at || j.created;
      if (!city || !createdAt) continue;
      if (!isToday(createdAt)) continue;

      map.set(city, (map.get(city) || 0) + 1);
    }

    // convert to array + sort descDESC (most jobs first)
    const arr = Array.from(map.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    // top 7 cities (you can change)
    return arr.slice(0, 7);
  }, [jobs]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    setIdx(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % items.length);
    }, 2500);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[idx];

  return (
    <div className="mb-3 rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
      <div className="text-xs font-semibold text-blue-700">Today’s job activity</div>

      <div className="mt-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.city}-${current.count}-${idx}`}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-semibold text-blue-900"
          >
            {current.city}: {current.count} job{current.count > 1 ? "s" : ""}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
