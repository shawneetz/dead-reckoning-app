import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null); // ← ADD THIS
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // ← ADD THIS: fetch profile whenever user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const API = import.meta.env.VITE_API_URL;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch(`${API}/api/profiles/by-id/${user.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setProfile(data);
        })
        .catch(() => {});
    });
  }, [user?.id]);

  const resetInactivityTimer = () => {
    if (!user) return;
    lastActivityRef.current = Date.now();
    setInactivityWarning(false);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(
      () => setInactivityWarning(true),
      INACTIVITY_TIMEOUT - 60000,
    );
    inactivityTimerRef.current = setTimeout(
      () => handleAutoLogout(),
      INACTIVITY_TIMEOUT,
    );
  };

  const handleAutoLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setInactivityWarning(false);
  };

  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      return;
    }
    resetInactivityTimer();
    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    const handleActivity = () => resetInactivityTimer();
    activityEvents.forEach((e) =>
      window.addEventListener(e, handleActivity, true),
    );
    return () => {
      activityEvents.forEach((e) =>
        window.removeEventListener(e, handleActivity, true),
      );
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  const signInWithGitHub = () =>
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  const signInWithEmail = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  const signUpWithEmail = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = async () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setInactivityWarning(false);
    setProfile(null); // ← ADD THIS
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        inactivityWarning, // ← ADD profile
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
