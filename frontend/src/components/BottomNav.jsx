import { NavLink } from "react-router-dom";
import Badge from "./Badge.jsx";

function Tab({ to, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative flex flex-1 items-center justify-center",
          "min-h-[56px] px-2", // ✅ bigger touch area
          "text-sm font-semibold", // ✅ readable
          isActive ? "text-blue-600" : "text-gray-500"
        ].join(" ")
      }
    >
      <span>{label}</span>
      {to === "/alerts" ? <Badge value={badge} /> : null}
    </NavLink>
  );
}

export default function BottomNav({ badge = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className="mx-3 mb-3 rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
          {/* ✅ extra padding inside nav container */}
          <div className="flex px-1 py-1">
            <Tab to="/" label="Home" />
            <Tab to="/post" label="Post Job" />
            <Tab to="/alerts" label="Alerts" badge={badge} />
            <Tab to="/myposts" label="My Posts" />
            <Tab to="/updates" label="Updates" />
          </div>
        </div>

        {/* iPhone safe area */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
