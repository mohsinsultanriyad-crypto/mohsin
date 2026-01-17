import { Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <div style={{ paddingBottom: 80 }}> {/* ✅ IMPORTANT */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<PostJob />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      <BottomNav />
    </div>
  );
}
