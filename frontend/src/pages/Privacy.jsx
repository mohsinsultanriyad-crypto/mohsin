import FooterLinks from "../components/FooterLinks.jsx";

export default function Privacy({ go }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, paddingBottom: 78 }}>
      <div style={{ fontSize: 24, fontWeight: 900 }}>Privacy Policy</div>
      <div style={{ marginTop: 10, color: "#374151", fontWeight: 700, lineHeight: 1.6 }}>
        This app displays job posts submitted by users. We store job post data and push notification tokens to provide job alerts.
        Do not share sensitive personal information beyond what is required to contact an employer.
      </div>
      <FooterLinks go={go} />
    </div>
  );
}
