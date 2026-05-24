import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export function useRouteSync({ steps, origin, stats }) {
  const { user } = useAuth();
  const [savedRoute, setSavedRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const saveRoute = useCallback(
    async (title, description, isPublic) => {
      if (!user || !origin) return;
      setSaving(true);
      setSaveError(null);
      try {
        // Map frontend step shape { bearing, distance, label }
        // to API shape { bearing_deg, distance_m, label }
        const mappedSteps = steps.map((s, i) => ({
          step_index: i,
          bearing_deg: s.bearing,
          distance_m: s.distance,
          label: s.label || null,
          description: s.description || null,
          image_url: s.imageUrl || null,
          pin_icon_id: s.pinIconId || null,
          pin_color: s.pinColor || "#378ADD",
        }));

        const payload = {
          title,
          description,
          origin_lat: origin[0],
          origin_lng: origin[1],
          is_public: isPublic,
          total_walked_m: stats.totalWalked,
          displacement_m: stats.displacement,
          drift_pct: parseFloat(stats.driftPct),
          bearing_deg: stats.bearing,
          steps: mappedSteps,
        };

        let route;
        if (savedRoute?.id) {
          // Update existing route metadata
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
            }),
          });
          // Replace steps
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
        }

        setSavedRoute(route);
        return route;
      } catch (e) {
        setSaveError(e.message);
      } finally {
        setSaving(false);
      }
    },
    [user, origin, steps, stats, savedRoute],
  );

  const loadRoute = useCallback(async (routeId) => {
    const [route, stepsData] = await Promise.all([
      apiFetch(`/api/routes/${routeId}`),
      apiFetch(`/api/routes/${routeId}/steps`),
    ]);
    setSavedRoute(route);
    // Map API shape back to frontend step shape
    const mappedSteps = stepsData.map((s) => ({
      bearing: s.bearing_deg,
      distance: s.distance_m,
      label: s.label || "",
    }));
    return { route, steps: mappedSteps };
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

  return { savedRoute, saving, saveError, saveRoute, loadRoute, togglePublic };
}
