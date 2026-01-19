import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from "./routes.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Container from "./components/Container.jsx";
import { useEffect } from "react";
import { initFcmForegroundListener, registerMessagingSW } from "./firebase.js";
import { bumpBadge, getBadge, resetBadge } from "./lib/storage.js";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // register service worker for FCM
    registerMessagingSW();

    // foreground messages (app open)
    initFcmForegroundListener((payload) => {
      const targetTab = payload?.data?.targetTab;
      // increment badge on job/news
      bumpBadge(1);

      // optional auto route when user is already in app
      // keep app stable: do not force navigate always
      if (targetTab === "alerts") {
        // do nothing, user can tap badge
      }
      if (targetTab === "updates") {
        // do nothing
      }
    });
  }, []);

  useEffect(() => {
    // When user opens Alerts tab -> reset badge
    if (location.pathname === "/alerts") resetBadge();
  }, [location.pathname]);

  // expose badge to force re-render on route change
  const badge = getBadge();

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <Routes>
          {routes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </Container>

      <BottomNav badge={badge} />
    </div>
  );
}
