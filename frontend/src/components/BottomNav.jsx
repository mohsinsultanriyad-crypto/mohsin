import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkStyle = ({ isActive }) => ({
    flex: 1,
    textAlign: "center",
    padding: "10px 6px",
    fontSize: 13,
    fontWeight: 600,
    color: isActive ? "#111827" : "#6B7280",
    textDecoration: "none",
  });

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 62,            // ✅ IMPORTANT
        background: "white",
        borderTop: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <NavLink to="/" style={linkStyle}>Home</NavLink>
      <NavLink to="/post" style={linkStyle}>Post Job</NavLink>
      <NavLink to="/alerts" style={linkStyle}>Alerts</NavLink>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
    </div>
  );
}
