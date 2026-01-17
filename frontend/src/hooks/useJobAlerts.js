import { useEffect, useRef } from "react";
import { getJobs } from "../services/api.js";

const norm = (r) => String(r || "").trim().toLowerCase();

export default function useJobAlerts({ enabled, roles, setAlertList }) {
  const lastTs = useRef(Number(localStorage.getItem("sj_last_jobs_ts") || "0"));

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function poll() {
      try {
        const data = await getJobs({ limit: 25, skip: 0 });
        const items = data?.items || [];
        const selected = (roles || []).map(norm).filter(Boolean);
        if (!selected.length) return;

        const newOnes = [];
        for (const j of items) {
          const created = new Date(j.createdAt || 0).getTime();
          if (created <= lastTs.current) continue;
          if (!selected.includes(norm(j.jobRole))) continue;
          newOnes.push(j);
        }

        if (newOnes.length && !cancelled) {
          const newest = Math.max(...newOnes.map(j => new Date(j.createdAt || 0).getTime()));
          lastTs.current = Math.max(lastTs.current, newest);
          localStorage.setItem("sj_last_jobs_ts", String(lastTs.current));

          setAlertList(prev => {
            const prevList = prev || [];
            const prevIds = new Set(prevList.map(a => a.jobId));
            const additions = newOnes
              .filter(j => !prevIds.has(j._id))
              .map(j => ({
                id: `${j._id}-${Date.now()}`,
                jobId: j._id,
                jobSnapshot: j,
                seen: false
              }));
            return [...additions, ...prevList];
          });
        }
      } catch {}
    }

    poll();
    const t = setInterval(poll, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, [enabled, roles, setAlertList]);
}
