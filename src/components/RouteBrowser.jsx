import { useState, useEffect } from "react";
import { HISTORICAL_ROUTES, PLACE_ROUTES } from "../utils/routes";
import { apiFetch } from "../lib/api";

const TABS = [
  { id: "historical", label: "Historical" },
  { id: "place", label: "Places" },
  { id: "public", label: "Public Routes" },
];

function RouteCard({ route, onLoad }) {
  const isSeeded = !!route.origin; // seeded routes have origin array, API routes have origin_lat/lng

  const origin = isSeeded ? route.origin : [route.origin_lat, route.origin_lng];

  const steps = isSeeded ? route.steps : null; // API routes need separate step load

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
            {(route.subtitle || route.description) && (
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 12,
                  color: "var(--ochre)",
                  fontStyle: "italic",
                  marginTop: 1,
                }}
              >
                {route.subtitle ||
                  route.description?.slice(0, 72) +
                    (route.description?.length > 72 ? "…" : "")}
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
        {/* Show description if it wasn't used as subtitle */}
        {!route.subtitle &&
          route.description &&
          route.description.length > 72 && (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 13,
                color: "var(--mahogany)",
                lineHeight: 1.5,
                marginBottom: 10,
              }}
            >
              {route.description}
            </p>
          )}
        {route.subtitle && route.description && (
          <p
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 13,
              color: "var(--mahogany)",
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          >
            {route.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 12,
              color: "var(--taupe)",
            }}
          >
            <span>{route.steps?.length ?? route.step_count ?? "?"} steps</span>
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
            onClick={() => onLoad(route)}
            className="btn-stamp px-4 py-1.5"
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
            Load Route
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RouteBrowser({ onLoad, onClose }) {
  const [tab, setTab] = useState("historical");

  // Public routes tab state
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [pubError, setPubError] = useState(null);
  const [pubFetched, setPubFetched] = useState(false);
  const [pubSearch, setPubSearch] = useState("");

  // Fetch public routes lazily when tab is first selected
  useEffect(() => {
    if (tab !== "public" || pubFetched) return;
    setPubLoading(true);
    apiFetch("/api/routes/?limit=100")
      .then((data) => {
        // Filter to user-created public routes only (not the seeded historical/place ones)
        const SEEDED_IDS = new Set([
          "ba1a0001-0000-4000-8000-000000000001",
          "ba1a0001-0000-4000-8000-000000000002",
          "ba1a0001-0000-4000-8000-000000000003",
          "ba1a0001-0000-4000-8000-000000000004",
          "ba1a0001-0000-4000-8000-000000000005",
          "ba1a0001-0000-4000-8000-000000000006",
        ]);
        setPublicRoutes(data.filter((r) => !SEEDED_IDS.has(r.id)));
        setPubFetched(true);
      })
      .catch((e) => setPubError(e.message))
      .finally(() => setPubLoading(false));
  }, [tab, pubFetched]);

  // Handle loading either a seeded route or an API route
  async function handleLoad(route) {
    const isSeeded = Array.isArray(route.origin);

    if (isSeeded) {
      // Seeded route — all data already present, pass straight through
      onLoad(route);
      onClose();
      return;
    }

    // API route — need to fetch steps separately
    try {
      const steps = await apiFetch(`/api/routes/${route.id}/steps`);
      const normalized = {
        origin: [route.origin_lat, route.origin_lng],
        originMeta: {
          label: route.title,
          description: route.description || "",
          duration: 0,
          pinIcon: null,
        },
        steps: steps.map((s) => ({
          bearing: s.bearing_deg,
          distance: s.distance_m,
          label: s.label || "",
          description: s.description || "",
          pinColor: s.pin_color || "#378ADD",
        })),
        title: route.title,
        is_public: route.is_public,
        category: route.category,
      };
      onLoad(normalized);
      onClose();
    } catch (e) {
      alert("Failed to load route: " + e.message);
    }
  }

  const seededRoutes = tab === "historical" ? HISTORICAL_ROUTES : PLACE_ROUTES;

  const filteredPublic = publicRoutes.filter(
    (r) =>
      !pubSearch ||
      r.title?.toLowerCase().includes(pubSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(pubSearch.toLowerCase()),
  );

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

        {/* Search bar — only on public tab */}
        {tab === "public" && (
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{
              borderBottom: "1px solid var(--coolstone)",
              background: "var(--cream)",
            }}
          >
            <input
              type="text"
              placeholder="Search public routes…"
              value={pubSearch}
              onChange={(e) => setPubSearch(e.target.value)}
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
        )}

        {/* Content — scrollable */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {/* Historical + Places tabs — seeded routes */}
          {(tab === "historical" || tab === "place") &&
            seededRoutes.map((route) => (
              <RouteCard key={route.id} route={route} onLoad={handleLoad} />
            ))}

          {/* Public Routes tab — live API */}
          {tab === "public" && (
            <>
              {pubLoading && (
                <p
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 14,
                    color: "var(--taupe)",
                    fontStyle: "italic",
                  }}
                  className="py-6 text-center"
                >
                  Loading public routes…
                </p>
              )}

              {pubError && (
                <p
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 14,
                    color: "#7A1A1A",
                  }}
                  className="py-4"
                >
                  {pubError}
                </p>
              )}

              {!pubLoading && !pubError && filteredPublic.length === 0 && (
                <div className="py-10 text-center flex flex-col items-center gap-4">
                  <p
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 15,
                      color: "var(--taupe)",
                      fontStyle: "italic",
                    }}
                  >
                    {pubSearch
                      ? "No routes match your search."
                      : "No public routes yet. Be the first to publish one."}
                  </p>
                  {!pubSearch && (
                    <p
                      style={{
                        fontFamily: "EB Garamond, serif",
                        fontSize: 13,
                        color: "var(--taupe)",
                        fontStyle: "italic",
                      }}
                    >
                      Create a route in the navigator, save it, then toggle it
                      Public.
                    </p>
                  )}
                </div>
              )}

              {!pubLoading &&
                filteredPublic.map((route) => (
                  <RouteCard key={route.id} route={route} onLoad={handleLoad} />
                ))}
            </>
          )}
        </div>

        {/* Footer — public tab only, shows count */}
        {tab === "public" && !pubLoading && pubFetched && (
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
              {filteredPublic.length} public route
              {filteredPublic.length !== 1 ? "s" : ""}
              {pubSearch ? " matching your search" : " from the community"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
