import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import MapApp from "./pages/MapApp";
import Gallery from "./pages/Gallery";
import RoutePage from "./pages/RoutePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: "var(--linen)" }}
      >
        <p
          style={{
            fontFamily: "EB Garamond, serif",
            color: "var(--taupe)",
            fontStyle: "italic",
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/app" element={<MapApp />} />
      <Route path="/app/:routeId" element={<MapApp />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/r/:routeId" element={<RoutePage />} />
      <Route path="/u/:username" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
