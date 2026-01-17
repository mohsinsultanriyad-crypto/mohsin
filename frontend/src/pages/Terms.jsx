import FooterLinks from "../components/FooterLinks.jsx";

export default function Terms({ go }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>Terms & Conditions</div>
      <div style={{ marginTop: 10, color: "#374151", fontWeight: 700, lineHeight: 1.6 }}>
        Users are responsible for the accuracy of posted jobs. The app is a platform and does not guarantee hiring or employment.
        Please verify details before sharing documents or money.
      </div>
      <FooterLinks go={go} />
    </div>
  );
}
