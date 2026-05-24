import { useState } from "react";
import { HISTORICAL_ROUTES, PLACE_ROUTES } from "../utils/routes";

const TABS = [
  { id: "historical", label: "Historical" },
  { id: "place", label: "Places" },
];

export default function RouteBrowser({ onLoad, onClose }) {
  const [tab, setTab] = useState("historical");

  const routes = tab === "historical" ? HISTORICAL_ROUTES : PLACE_ROUTES;

  function handleLoad(route) {
    onLoad(route);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-1500"
        style={{
          background: "rgba(44,24,16,0.45)",
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed z-1600 top-1/2 left-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          width: "min(560px, 92vw)",
          maxHeight: "80vh",
          background: "var(--cream)",
          border: "2px solid var(--mahogany)",
          boxShadow: "8px 8px 0px var(--ink)",
          display: "flex",
          flexDirection: "column",
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
              Load a route to explore
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--sand)",
              fontSize: 18,
              lineHeight: 1,
              fontFamily: "Cinzel, serif",
            }}
            className="hover:opacity-60 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-shrink-0"
          style={{ borderBottom: "2px solid var(--mahogany)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 transition-colors"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.22em",
                color: tab === t.id ? "var(--ink)" : "var(--taupe)",
                background: tab === t.id ? "var(--parchment)" : "var(--linen)",
                borderBottom:
                  tab === t.id ? "2px solid var(--mahogany)" : "none",
                marginBottom: tab === t.id ? -2 : 0,
              }}
              className="flex-1 py-2.5 uppercase hover:opacity-80 transition-opacity"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Route list — scrollable */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
          {routes.map((route) => (
            <div
              key={route.id}
              style={{
                background: "var(--parchment)",
                border: "2px solid var(--leather)",
                boxShadow: "3px 3px 0px var(--taupe)",
              }}
            >
              {/* Route header */}
              <div
                className="px-4 pt-3 pb-2"
                style={{ borderBottom: "1px solid var(--coolstone)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontSize: 12,
                        color: "var(--ink)",
                        letterSpacing: "0.06em",
                      }}
                      className="font-bold uppercase truncate"
                    >
                      {route.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "EB Garamond, serif",
                        fontSize: 12,
                        color: "var(--ochre)",
                        fontStyle: "italic",
                      }}
                      className="mt-0.5"
                    >
                      {route.subtitle}
                    </p>
                  </div>
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
                </div>
              </div>

              {/* Description + meta */}
              <div className="px-4 py-3">
                <p
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 14,
                    color: "var(--mahogany)",
                    lineHeight: 1.55,
                  }}
                  className="mb-3"
                >
                  {route.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 12,
                      color: "var(--taupe)",
                    }}
                  >
                    {route.steps.length} steps · {route.originMeta.label}
                  </span>
                  <button
                    onClick={() => handleLoad(route)}
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
          ))}
        </div>
      </div>
    </>
  );
}
