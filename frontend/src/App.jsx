import { Routes, Route, useLocation } from "react-router-dom";
import { routes } from "./routes.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Container from "./components/Container.jsx";
import Header from "./components/Header.jsx";   // ✅ ADD
import { useEffect, useState } from "react";
import { initFcmForegroundListener, registerMessagingSW } from "./firebase.js";
import { bumpBadge, getBadge, resetBadge } from "./lib/storage.js";

export default function App() {
  const location = useLocation();
  const [badge, setBadge] = useState(getBadge());

  useEffect(() => {
    registerMessagingSW();
    initFcmForegroundListener(() => {
      bumpBadge(1);
      setBadge(getBadge());
    });
  }, []);

  useEffect(() => {
    if (location.pathname === "/alerts") {
      resetBadge();
      setBadge(0);
    } else {
      setBadge(getBadge());
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      
      {/* ✅ Header always on top */}
      <Header />

      <Container>
        <div className="pb-28">
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </div>
      </Container>

      <BottomNav badge={badge} />
    </div>
  );
}