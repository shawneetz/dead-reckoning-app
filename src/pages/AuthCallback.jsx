import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle hash-based token (Supabase implicit flow fallback)
    // This fires when Supabase redirects to /#access_token=...
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app", { replace: true });
        return;
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/app", { replace: true });
      }
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
          Balangay
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
