import { NavLink } from "react-router-dom";

const itemCls = ({ isActive }) =>
  [
    "flex-1 text-center py-3 font-extrabold",
    isActive ? "text-black" : "text-gray-400"
  ].join(" ");

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-md mx-auto flex">
        <NavLink className={itemCls} to="/">Home</NavLink>
        <NavLink className={itemCls} to="/post">Post Job</NavLink>
        <NavLink className={itemCls} to="/alerts">Alerts</NavLink>
        <NavLink className={itemCls} to="/dashboard">Dashboard</NavLink>
      </div>
    </div>
  );
}
