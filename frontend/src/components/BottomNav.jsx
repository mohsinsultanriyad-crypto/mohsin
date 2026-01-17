export default function BottomNav({ active, onChange }) {
  const btn = (key, label) => (
    <button
      onClick={() => onChange(key)}
      style={{
        flex: 1,
        height: 52,
        border: "none",
        background: "#fff",
        fontWeight: active === key ? 900 : 700,
        color: active === key ? "#111827" : "#6b7280",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      {btn("home", "Home")}
      {btn("post", "Post Job")}
      {btn("alerts", "Alerts")}
      {btn("dashboard", "Dashboard")}
    </div>
  );
}
