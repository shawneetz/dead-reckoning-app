// src/components/RouteBrowser.jsx
//
// All routes come from the backend API (/api/routes/?limit=200).
// Historical / Places tabs filter client-side on route.category.
// Public Routes tab shows everything without a named category.
// step_count is now returned by the API list endpoint.

import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

const TABS = [
  { id: "historical", label: "Historical" },
  { id: "place", label: "Places" },
  { id: "public", label: "Public Routes" },
];

function RouteCard({ route, onLoad }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onLoad(route);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--parchment)",
        border: "2px solid var(--leather)",
        boxShadow: "3px 3px 0px var(--taupe)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-3 pb-2"
        style={{ borderBottom: "1px solid var(--coolstone)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 11,
                color: "var(--ink)",
                letterSpacing: "0.06em",
              }}
              className="font-bold uppercase truncate"
            >
              {route.title}
            </h3>
            {route.description && (
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 12,
                  color: "var(--ochre)",
                  fontStyle: "italic",
                  marginTop: 1,
                }}
              >
                {route.description.slice(0, 80) +
                  (route.description.length > 80 ? "…" : "")}
              </p>
            )}
          </div>
          {route.is_public && (
            <span
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 7,
                letterSpacing: "0.18em",
                color: "var(--parchment)",
                background: "var(--moss)",
                padding: "2px 8px",
                flexShrink: 0,
                marginTop: 2,
              }}
              className="uppercase"
            >
              Public
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 12,
              color: "var(--taupe)",
            }}
          >
            <span>
              {route.step_count != null ? route.step_count : "?"} steps
            </span>
            {route.drift_pct != null && (
              <span
                style={{
                  marginLeft: 8,
                  color:
                    parseFloat(route.drift_pct) > 40
                      ? "#7A1A1A"
                      : "var(--moss)",
                  fontWeight: 500,
                }}
              >
                · {parseFloat(route.drift_pct).toFixed(1)}% drift
              </span>
            )}
          </div>
          <button
            onClick={handleClick}
            disabled={loading}
            className="btn-stamp px-4 py-1.5 disabled:opacity-50"
            style={{
              background: "var(--mahogany)",
              border: "2px solid var(--ink)",
              color: "var(--parchment)",
              boxShadow: "3px 3px 0px var(--ink)",
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.18em",
            }}
          >
            {loading ? "Loading…" : "Load Route"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RouteBrowser({ onLoad, onClose }) {
  const [tab, setTab] = useState("historical");
  const [search, setSearch] = useState("");

  // All public routes fetched once on mount; tabs filter client-side
  const [allRoutes, setAllRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/routes/?limit=200")
      .then(setAllRoutes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch the route's steps, normalise shape, call parent's onLoad
  async function handleLoad(route) {
    const steps = await apiFetch(`/api/routes/${route.id}/steps`);
    const normalized = {
      origin: [route.origin_lat, route.origin_lng],
      originMeta: {
        label: route.origin_label || "",
        description: route.origin_description || "",
        duration: route.origin_duration || 0,
        pinIcon: null,
      },
      steps: steps.map((s) => ({
        bearing: s.bearing_deg,
        distance: s.distance_m,
        label: s.label || "",
        description: s.description || "",
        duration: s.duration_sec || 0,
        imageUrl: s.image_url || "",
        pinColor: s.pin_color || "#378ADD",
        pinIcon: null,
      })),
      title: route.title,
      is_public: route.is_public,
      category: route.category,
    };
    onLoad(normalized);
    onClose();
  }

  // Filter by active tab then by search query
  const tabRoutes = allRoutes.filter((r) => {
    if (tab === "historical") return r.category === "historical";
    if (tab === "place") return r.category === "place";
    // "public" tab = community routes (no category or unrecognised category)
    return (
      !r.category || (r.category !== "historical" && r.category !== "place")
    );
  });

  const filtered = tabRoutes.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1500]"
        style={{
          background: "rgba(44,24,16,0.45)",
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed z-[1600] top-1/2 left-1/2 flex flex-col"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(580px, 94vw)",
          maxHeight: "82vh",
          background: "var(--cream)",
          border: "2px solid var(--mahogany)",
          boxShadow: "8px 8px 0px var(--ink)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: "var(--mahogany)",
            borderBottom: "2px solid var(--ink)",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 13,
                letterSpacing: "0.18em",
                color: "var(--parchment)",
              }}
              className="font-bold uppercase"
            >
              Browse Routes
            </h2>
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 13,
                color: "var(--sand)",
                fontStyle: "italic",
              }}
              className="mt-0.5"
            >
              Load a route into the navigator
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--sand)", fontSize: 20, lineHeight: 1 }}
            className="hover:opacity-60 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-shrink-0"
          style={{
            borderBottom: "2px solid var(--mahogany)",
            background: "var(--linen)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 uppercase hover:opacity-80 transition-opacity"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.2em",
                color: tab === t.id ? "var(--parchment)" : "var(--taupe)",
                background: tab === t.id ? "var(--mahogany)" : "transparent",
                borderRight:
                  t.id !== "public" ? "1px solid var(--taupe)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{
            borderBottom: "1px solid var(--coolstone)",
            background: "var(--cream)",
          }}
        >
          <input
            type="text"
            placeholder="Search routes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              fontFamily: "EB Garamond, serif",
              fontSize: 14,
              background: "var(--parchment)",
              border: "1.5px solid var(--taupe)",
              color: "var(--ink)",
              padding: "6px 10px",
            }}
          />
        </div>

        {/* Route list */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {loading && (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 14,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
              className="py-6 text-center"
            >
              Loading routes…
            </p>
          )}

          {!loading && error && (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 14,
                color: "#7A1A1A",
              }}
              className="py-4"
            >
              {error}
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-10 text-center flex flex-col items-center gap-4">
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 15,
                  color: "var(--taupe)",
                  fontStyle: "italic",
                }}
              >
                {search
                  ? "No routes match your search."
                  : tab === "public"
                    ? "No public routes yet. Be the first to publish one."
                    : "No routes in this category yet."}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((route) => (
              <RouteCard key={route.id} route={route} onLoad={handleLoad} />
            ))}
        </div>

        {/* Footer */}
        {!loading && (
          <div
            className="px-5 py-2 flex-shrink-0"
            style={{
              borderTop: "1px solid var(--coolstone)",
              background: "var(--linen)",
            }}
          >
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 12,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              {filtered.length} route{filtered.length !== 1 ? "s" : ""}
              {search ? " matching your search" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
