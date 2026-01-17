import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import BottomNav from "./components/BottomNav";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<PostJob />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      <BottomNav />
    </BrowserRouter>
  );
}
