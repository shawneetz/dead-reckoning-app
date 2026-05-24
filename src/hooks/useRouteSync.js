import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export const MAX_ROUTES = 10;

export function useRouteSync({ steps, origin, originMeta, stats }) {
  const { user } = useAuth();
  const [savedRoute, setSavedRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [routeCount, setRouteCount] = useState(0);

  // Fetch route count on sign-in
  useEffect(() => {
    if (!user) {
      setRouteCount(0);
      return;
    }
    apiFetch("/api/routes/mine")
      .then((routes) => setRouteCount(routes.length))
      .catch(() => {});
  }, [user]);

  const atRouteLimit = user && routeCount >= MAX_ROUTES && !savedRoute?.id;

  const saveRoute = useCallback(
    async (title, description, isPublic) => {
      if (!user || !origin) return;
      setSaving(true);
      setSaveError(null);
      try {
        const mappedSteps = steps.map((s, i) => ({
          step_index: i,
          bearing_deg: s.bearing,
          distance_m: s.distance,
          label: s.label || null,
          description: s.description || null,
          image_url: s.imageUrl || null,
          pin_icon_id: s.pinIconId || null,
          pin_color: s.pinColor || "#378ADD",
          duration_sec: s.duration || 0,
        }));

        const payload = {
          title,
          description,
          origin_lat: origin[0],
          origin_lng: origin[1],
          origin_label: originMeta?.label || null,
          origin_description: originMeta?.description || null,
          origin_duration: originMeta?.duration || 0,
          is_public: isPublic,
          total_walked_m: stats.totalWalked,
          displacement_m: stats.displacement,
          drift_pct: parseFloat(stats.driftPct),
          bearing_deg: stats.bearing,
          steps: mappedSteps,
        };

        let route;
        if (savedRoute?.id) {
          await apiFetch(`/api/routes/${savedRoute.id}`, {
            method: "PUT",
            body: JSON.stringify({
              title,
              description,
              is_public: isPublic,
              total_walked_m: stats.totalWalked,
              displacement_m: stats.displacement,
              drift_pct: parseFloat(stats.driftPct),
              bearing_deg: stats.bearing,
              origin_label: originMeta?.label || null,
              origin_description: originMeta?.description || null,
              origin_duration: originMeta?.duration || 0,
            }),
          });
          await apiFetch(`/api/routes/${savedRoute.id}/steps`, {
            method: "PUT",
            body: JSON.stringify(mappedSteps),
          });
          route = { ...savedRoute, title, is_public: isPublic };
        } else {
          route = await apiFetch("/api/routes/", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          setRouteCount((c) => c + 1);
        }

        setSavedRoute(route);
        return route;
      } catch (e) {
        setSaveError(e.message);
      } finally {
        setSaving(false);
      }
    },
    [user, origin, originMeta, steps, stats, savedRoute],
  );

  const loadRoute = useCallback(async (routeId) => {
    const [route, stepsData] = await Promise.all([
      apiFetch(`/api/routes/${routeId}`),
      apiFetch(`/api/routes/${routeId}/steps`),
    ]);
    setSavedRoute(route);

    const mappedSteps = stepsData.map((s) => ({
      bearing: s.bearing_deg,
      distance: s.distance_m,
      label: s.label || "",
      description: s.description || "",
      duration: s.duration_sec || 0,
      pinIcon: null, // pinIcon not yet roundtripped from DB
    }));

    const loadedOriginMeta = {
      label: route.origin_label || "",
      description: route.origin_description || "",
      duration: route.origin_duration || 0,
      pinIcon: null,
    };

    return { route, steps: mappedSteps, originMeta: loadedOriginMeta };
  }, []);

  const togglePublic = useCallback(async () => {
    if (!savedRoute) return;
    const updated = await apiFetch(`/api/routes/${savedRoute.id}`, {
      method: "PUT",
      body: JSON.stringify({ is_public: !savedRoute.is_public }),
    });
    setSavedRoute(updated);
    return updated;
  }, [savedRoute]);

  const clearSavedRoute = useCallback(() => {
    setSavedRoute(null);
    setRouteCount((c) => Math.max(0, c - 1));
  }, []);

  return {
    savedRoute,
    saving,
    saveError,
    routeCount,
    atRouteLimit,
    MAX_ROUTES,
    saveRoute,
    loadRoute,
    togglePublic,
    clearSavedRoute,
  };
}
