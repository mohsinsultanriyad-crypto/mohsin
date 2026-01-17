import { useState } from "react";
import BottomNav from "./components/BottomNav.jsx";
import Home from "./pages/Home.jsx";
import PostJob from "./pages/PostJob.jsx";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";

export default function App() {
  const [page, setPage] = useState("home");

  const go = (p) => setPage(p);

  return (
    <>
      {page === "home" && <Home go={go} />}
      {page === "post" && <PostJob go={go} />}
      {page === "alerts" && <Alerts go={go} />}
      {page === "dashboard" && <Dashboard go={go} />}
      {page === "privacy" && <Privacy go={go} />}
      {page === "terms" && <Terms go={go} />}

      {["home", "post", "alerts", "dashboard"].includes(page) && (
        <BottomNav active={page} onChange={setPage} />
      )}
    </>
  );
}
