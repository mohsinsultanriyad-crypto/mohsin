import Home from "./pages/Home.jsx";
import PostJob from "./pages/PostJob.jsx";
import Alerts from "./pages/Alerts.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import Updates from "./pages/Updates.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/post", element: <PostJob /> },
  { path: "/alerts", element: <Alerts /> },
  { path: "/myposts", element: <MyPosts /> },
  { path: "/updates", element: <Updates /> },
  { path: "/terms", element: <Terms /> },
  { path: "/privacy", element: <Privacy /> }
];
