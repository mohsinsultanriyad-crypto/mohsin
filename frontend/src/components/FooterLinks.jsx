export default function FooterLinks({ go }) {
  return (
    <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        <button
          onClick={() => go("privacy")}
          style={{ border: "none", background: "transparent", fontWeight: 800, color: "#2563eb" }}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => go("terms")}
          style={{ border: "none", background: "transparent", fontWeight: 800, color: "#2563eb" }}
        >
          Terms & Conditions
        </button>
      </div>
    </div>
  );
}
