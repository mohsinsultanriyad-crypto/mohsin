import { useEffect, useMemo, useState } from "react";
import { apiGetJobById } from "../services/api";

const LS_KEY = "SAUDI_JOB_ALERTS"; // array of {type:'job', jobId, title, body, ts}

function readAlerts() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAlerts(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(() => readAlerts());
  const [jobsMap, setJobsMap] = useState({}); // {jobId: jobData}
  const [loading, setLoading] = useState(false);

  // when user opens alerts -> reset badge
  useEffect(() => {
    localStorage.setItem("ALERT_BADGE", "0");
  }, []);

  // auto refresh alerts from localStorage
  useEffect(() => {
    const onMsg = (e) => {
      if (e?.data?.type === "PUSH_ALERT") {
        setAlerts(readAlerts());
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // verify job exists for each job alert
  useEffect(() => {
    let alive = true;

    (async () => {
      const list = readAlerts();
      setAlerts(list);

      const jobAlerts = list.filter((a) => a?.type === "job" && a?.jobId);
      if (jobAlerts.length === 0) {
        setJobsMap({});
        return;
      }

      setLoading(true);

      const nextMap = {};
      const keepAlerts = [];

      for (const a of list) {
        if (a?.type !== "job" || !a?.jobId) {
          keepAlerts.push(a);
          continue;
        }

        try {
          const job = await apiGetJobById(a.jobId);
          nextMap[a.jobId] = job;
          keepAlerts.push(a); // keep only if job exists
        } catch {
          // job deleted or not found => remove from alerts
        }
      }

      if (!alive) return;

      // save cleaned alerts (removed deleted jobs)
      writeAlerts(keepAlerts);
      setAlerts(keepAlerts);
      setJobsMap(nextMap);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const visibleAlerts = useMemo(() => {
    return alerts
      .slice()
      .sort((a, b) => (b?.ts || 0) - (a?.ts || 0));
  }, [alerts]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
        Alerts
      </h2>

      {loading && <div>Checking alerts…</div>}

      {visibleAlerts.length === 0 && !loading && (
        <div>No alerts yet.</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {visibleAlerts.map((a, idx) => {
          const job = a.type === "job" ? jobsMap[a.jobId] : null;

          return (
            <div
              key={`${a.jobId || a.link || "a"}-${idx}`}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {a.title || (job ? job.jobRole : "Alert")}
              </div>

              {a.body && (
                <div style={{ opacity: 0.8, marginTop: 6 }}>{a.body}</div>
              )}

              {job && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
                  <div>
                    <b>Role:</b> {job.jobRole}
                  </div>
                  <div>
                    <b>City:</b> {job.city}
                  </div>
                  <div>
                    <b>Views:</b> {job.views || 0}
                  </div>

                  <button
                    onClick={() => {
                      // open job details on home (simple way)
                      // you can also navigate if router is used
                      window.location.href = "/?openJob=" + job._id;
                    }}
                    style={{
                      marginTop: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: 700,
                    }}
                  >
                    Open Job
                  </button>
                </div>
              )}

              {!job && a.type === "job" && (
                <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
                  (Job removed / expired)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
