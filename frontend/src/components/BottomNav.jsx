import { Link, useLocation } from "react-router-dom";

function Tab({ to, label, active, badge }) {
  return (
    <Link to={to} className="flex-1">
      <div className={`relative py-3 text-center text-sm ${active ? "font-semibold text-blue-600" : "text-gray-500"}`}>
        {label}
        {badge > 0 && (
          <span className="absolute top-2 right-6 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function BottomNav({ badgeCount }) {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto flex max-w-md">
        <Tab to="/" label="Home" active={pathname === "/"} />
        <Tab to="/post" label="Post Job" active={pathname === "/post"} />
        <Tab to="/alerts" label="Alerts" active={pathname === "/alerts"} badge={badgeCount} />
        <Tab to="/myposts" label="My Posts" active={pathname === "/myposts"} />
        <Tab to="/updates" label="Updates" active={pathname === "/updates"} />
      </div>
    </div>
  );
}
