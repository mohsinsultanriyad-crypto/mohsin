import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const [badge, setBadge] = useState(0);
  const loc = useLocation();

  // Load badge from localStorage
  useEffect(() => {
    const n = Number(localStorage.getItem("ALERT_BADGE") || "0");
    setBadge(n);
  }, []);

  // Alerts page open => badge clear
  useEffect(() => {
    if (loc.pathname === "/alerts") {
      localStorage.setItem("ALERT_BADGE", "0");
      setBadge(0);
    }
  }, [loc.pathname]);

  // service worker se message aaye to badge++
  useEffect(() => {
    const handler = (event) => {
      if (event?.data?.type === "PUSH_ALERT") {
        const cur = Number(localStorage.getItem("ALERT_BADGE") || "0") + 1;
        localStorage.setItem("ALERT_BADGE", String(cur));
        setBadge(cur);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handler);
    return () => navigator.serviceWorker?.removeEventListener("message", handler);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative font-bold px-2 py-1 ${
      isActive ? "text-black" : "text-gray-400"
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-around py-3">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/post" className={linkClass}>
          Post Job
        </NavLink>

        <NavLink to="/alerts" className={linkClass}>
          Alerts
          {badge > 0 && (
            <span className="absolute -top-2 -right-3 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
              {badge}
            </span>
          )}
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
      </div>
    </div>
  );
}
