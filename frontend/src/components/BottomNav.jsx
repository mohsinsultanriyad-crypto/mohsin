import { NavLink } from "react-router-dom";
import Badge from "./Badge.jsx";

function Tab({ to, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "relative flex flex-1 items-center justify-center",
          "min-h-[56px] px-2 rounded-full", // ✅ bigger tap area
          "text-[12px] font-semibold leading-tight text-center", // ✅ no weird break
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-100"
        ].join(" ")
      }
    >
      <span className="whitespace-normal">
        {label}
      </span>

      {to === "/alerts" ? <Badge value={badge} /> : null}
    </NavLink>
  );
}

export default function BottomNav({ badge = 0 }) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(520px,calc(100%-24px))]">
      <div className="rounded-full bg-white/95 shadow-soft ring-1 ring-black/10 px-2 py-2">
        <div className="flex gap-1">
          <Tab to="/" label="Home" badge={badge} />
          <Tab to="/post" label={"Post\nJob"} badge={badge} />
          <Tab to="/alerts" label="Alerts" badge={badge} />
          <Tab to="/myposts" label={"My\nPosts"} badge={badge} />
          <Tab to="/updates" label="Updates" badge={badge} />
        </div>
      </div>
    </div>
  );
}
