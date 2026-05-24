import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChange fires reliably after Supabase processes the OAuth code
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/app", { replace: true });
      } else if (event === "SIGNED_OUT" || !session) {
        navigate("/auth", { replace: true });
      }
    });

    // Fallback — if session already exists when page mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/app", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ background: "var(--linen)" }}
    >
      <div className="text-center">
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 12,
            letterSpacing: "0.25em",
            color: "var(--mahogany)",
          }}
          className="uppercase mb-2"
        >
          ⚓ Balangay
        </p>
        <p
          style={{
            fontFamily: "EB Garamond, serif",
            color: "var(--taupe)",
            fontStyle: "italic",
          }}
        >
          Signing you in…
        </p>
      </div>
    </div>
  );
}
