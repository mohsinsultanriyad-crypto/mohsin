import { NavLink } from "react-router-dom";
import Badge from "./Badge.jsx";

function Tab({ to, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative flex flex-1 flex-col items-center justify-center py-2 text-xs",
          isActive ? "text-blue-600" : "text-gray-500"
        ].join(" ")
      }
    >
      <span className="font-semibold">{label}</span>
      {to === "/alerts" ? <Badge value={badge} /> : null}
    </NavLink>
  );
}

export default function BottomNav({ badge = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className="mx-3 mb-3 rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
          <div className="flex">
            <Tab to="/" label="Home" />
            <Tab to="/post" label="Post Job" />
            <Tab to="/alerts" label="Alerts" badge={badge} />
            <Tab to="/myposts" label="My Posts" />
            <Tab to="/updates" label="Updates" />
          </div>
        </div>
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
