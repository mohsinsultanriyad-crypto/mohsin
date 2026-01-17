import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkClass =
    "flex-1 text-center py-3 text-sm font-medium text-gray-500";
  const activeClass =
    "text-green-600 border-t-2 border-green-600";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex z-50">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? `${linkClass} ${activeClass}` : linkClass
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/post"
        className={({ isActive }) =>
          isActive ? `${linkClass} ${activeClass}` : linkClass
        }
      >
        Post Job
      </NavLink>

      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          isActive ? `${linkClass} ${activeClass}` : linkClass
        }
      >
        Alerts
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          isActive ? `${linkClass} ${activeClass}` : linkClass
        }
      >
        Dashboard
      </NavLink>
    </div>
  );
}
