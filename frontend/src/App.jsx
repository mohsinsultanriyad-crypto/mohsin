import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import PostJob from "./pages/PostJob.jsx";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <BottomNav />

        <div className="fixed bottom-14 left-0 right-0 bg-white border-t">
          <div className="max-w-md mx-auto flex justify-between px-4 py-3 text-sm font-extrabold text-gray-500">
            <a className="underline" href="/privacy" onClick={(e)=>{e.preventDefault(); alert("Add Privacy page later");}}>Privacy Policy</a>
            <a className="underline" href="/terms" onClick={(e)=>{e.preventDefault(); alert("Add Terms page later");}}>Terms</a>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
