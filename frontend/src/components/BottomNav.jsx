import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const location = useLocation();
  const [badge, setBadge] = useState(0);

  // Read stored unread alert count
  useEffect(() => {
    const count = Number(localStorage.getItem("alertCount") || 0);
    setBadge(count);
  }, [location.pathname]);

  const tabs = [
    { name: "Home", path: "/" },
    { name: "Post Job", path: "/post" },
    { name: "Alerts", path: "/alerts" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={location.pathname === tab.path ? "active" : ""}
        >
          {tab.name}

          {/* 🔴 Badge only on Alerts */}
          {tab.name === "Alerts" && badge > 0 && (
            <span className="badge">{badge}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
