import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import MapApp from "./pages/MapApp";
import Gallery from "./pages/Gallery";
import RoutePage from "./pages/RoutePage";
import ProfilePage from "./pages/ProfilePage";
import { supabase } from "./lib/supabase";

function OAuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only run if URL has the OAuth hash fragment
    if (!window.location.hash.includes("access_token=")) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Clean the hash from the URL and go to app
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/app", { replace: true });
        subscription.unsubscribe();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

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
    <>
      <OAuthRedirectHandler />
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
    </>
  );
}
