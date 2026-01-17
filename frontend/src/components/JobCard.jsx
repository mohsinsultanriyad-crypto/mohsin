export default function JobCard({ job, onOpen }) {
  const urgentActive = !!job?.urgentUntil && new Date(job.urgentUntil).getTime() > Date.now();

  return (
    <div
      onClick={() => onOpen?.(job)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        cursor: "pointer",
        background: urgentActive ? "#fff5f5" : "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{job?.jobRole}</div>
        {urgentActive && (
          <div style={{ color: "#b91c1c", fontWeight: 900, fontSize: 12 }}>URGENT</div>
        )}
      </div>

      <div style={{ marginTop: 6, color: "#374151", fontWeight: 700 }}>
        {job?.city} {job?.companyName ? `• ${job.companyName}` : ""}
      </div>

      <div style={{ marginTop: 6, color: "#6b7280", fontWeight: 600, fontSize: 13 }}>
        Posted: {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}
      </div>
    </div>
  );
}
