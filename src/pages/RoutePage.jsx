import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";

export default function RoutePage() {
  const { routeId } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forking, setForking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeModalIndex, setActiveModalIndex] = useState(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!routeId) return;
    Promise.all([
      apiFetch(`/api/routes/${routeId}`),
      apiFetch(`/api/routes/${routeId}/steps`),
    ])
      .then(([r, s]) => {
        setRoute(r);
        setSteps(
          s.map((step) => ({
            bearing: step.bearing_deg,
            distance: step.distance_m,
            label: step.label || "",
            description: step.description || "",
            duration: step.duration_sec || 0,
            pinIcon: null,
          })),
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [routeId]);

  async function handleFork() {
    if (!user) {
      navigate("/auth");
      return;
    }
    setForking(true);
    try {
      const forked = await apiFetch(`/api/routes/${routeId}/fork`, {
        method: "POST",
      });
      navigate(`/app/${forked.id}`);
    } catch (e) {
      alert("Fork failed: " + e.message);
    } finally {
      setForking(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${route.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/routes/${routeId}`, { method: "DELETE" });
      navigate("/gallery");
    } catch (e) {
      alert("Delete failed: " + e.message);
      setDeleting(false);
    }
  }

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
          Loading route…
        </p>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div
        className="flex h-screen items-center justify-center flex-col gap-4"
        style={{ background: "var(--linen)" }}
      >
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "#7A1A1A",
          }}
          className="uppercase"
        >
          Route not found
        </p>
        <p
          style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 13,
            color: "var(--taupe)",
            fontStyle: "italic",
          }}
        >
          {error}
        </p>
        <Link
          to="/gallery"
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: "var(--ochre)",
          }}
          className="uppercase hover:opacity-70 transition-opacity"
        >
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  const drift = route.drift_pct != null ? parseFloat(route.drift_pct) : null;
  const driftColor =
    drift == null
      ? "var(--taupe)"
      : drift > 40
        ? "#7A1A1A"
        : drift > 10
          ? "var(--gold)"
          : "var(--moss)";

  const isOwner = user && route.user_id === user.id;

  const categoryStyle =
    route.category === "historical"
      ? { background: "var(--mahogany)", color: "var(--parchment)" }
      : route.category === "place"
        ? { background: "var(--moss)", color: "var(--cream)" }
        : null;
  const categoryLabel =
    route.category === "historical"
      ? "Historical"
      : route.category === "place"
        ? "Place"
        : null;

  // Reconstruct originMeta from DB fields so the origin popup works
  const originMeta = {
    label: route.origin_label || "",
    description: route.origin_description || "",
    duration: route.origin_duration || 0,
    pinIcon: null,
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "var(--linen)" }}
    >
      {/* Nav */}
      <nav
        style={{
          background: "var(--mahogany)",
          borderBottom: "2px solid var(--ink)",
          flexShrink: 0,
        }}
        className="flex items-center justify-between px-6 py-3"
      >
        <Link
          to="/gallery"
          style={{
            fontFamily: "Cinzel, serif",
            letterSpacing: "0.15em",
            color: "var(--parchment)",
            fontSize: 13,
          }}
          className="font-bold uppercase hover:opacity-80 transition-opacity"
        >
          ← Gallery
        </Link>
        <div className="flex gap-3 items-center">
          <Link
            to="/app"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--sand)",
            }}
            className="uppercase hover:text-[#F5EDD6] transition-colors"
          >
            New Route
          </Link>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting || forking}
              className="btn-stamp px-3 py-1.5"
              style={{
                background: "transparent",
                border: "2px solid #C47A5A",
                color: "#C47A5A",
                boxShadow: "3px 3px 0px #7A1A1A",
              }}
            >
              {deleting ? "Deleting…" : "✕ Delete"}
            </button>
          )}
          <button
            onClick={handleFork}
            disabled={forking || deleting}
            className="btn-stamp px-4 py-1.5"
            style={{
              background: "var(--parchment)",
              border: "2px solid var(--ink)",
              color: "var(--ink)",
              boxShadow: "3px 3px 0px var(--ink)",
            }}
          >
            {forking ? "Forking…" : "⑂ Fork Route"}
          </button>
          {user && (
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "var(--sand)",
              }}
              className="uppercase hover:text-[#F5EDD6] transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Info panel */}
        <div
          className="w-72 flex flex-col overflow-y-auto shrink-0"
          style={{
            borderRight: "2px solid var(--mahogany)",
            background: "var(--cream)",
          }}
        >
          <div
            className="p-5"
            style={{ borderBottom: "3px double var(--leather)" }}
          >
            {(categoryLabel || isOwner) && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {categoryLabel && (
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 7,
                      letterSpacing: "0.2em",
                      padding: "2px 8px",
                      ...categoryStyle,
                    }}
                    className="uppercase"
                  >
                    {categoryLabel}
                  </span>
                )}
                {isOwner && (
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 7,
                      letterSpacing: "0.18em",
                      color: "var(--moss)",
                      border: "1px solid var(--moss)",
                      padding: "2px 6px",
                    }}
                    className="uppercase"
                  >
                    Your Route
                  </span>
                )}
              </div>
            )}
            <h1
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 15,
                color: "var(--ink)",
                letterSpacing: "0.06em",
                lineHeight: 1.3,
              }}
              className="font-bold uppercase mb-2"
            >
              {route.title}
            </h1>
            {route.description && (
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 15,
                  color: "var(--ochre)",
                  lineHeight: 1.6,
                }}
              >
                {route.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div
            className="p-4"
            style={{ borderBottom: "1px solid var(--coolstone)" }}
          >
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.25em",
                color: "var(--ochre)",
              }}
              className="uppercase mb-3"
            >
              Navigation Stats
            </p>
            {[
              ["Steps", steps.length],
              [
                "Distance walked",
                route.total_walked_m != null
                  ? `${Math.round(route.total_walked_m).toLocaleString()}m`
                  : "—",
              ],
              [
                "Displacement",
                route.displacement_m != null
                  ? `${Math.round(route.displacement_m).toLocaleString()}m`
                  : "—",
              ],
              [
                "Direction",
                route.bearing_deg != null
                  ? `${Math.round(route.bearing_deg)}°`
                  : "—",
              ],
              ["Views", route.view_count ?? 0],
              ["Forks", route.fork_count ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between mb-1">
                <span
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 13,
                    color: "var(--taupe)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
            {drift != null && (
              <div
                className="mt-3 text-center py-2"
                style={{
                  border: `2px solid ${driftColor}`,
                  background: "var(--parchment)",
                }}
              >
                <span
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 22,
                    fontWeight: 500,
                    color: driftColor,
                  }}
                >
                  {drift.toFixed(1)}%
                </span>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 8,
                    letterSpacing: "0.2em",
                    color: "var(--taupe)",
                  }}
                  className="uppercase mt-0.5"
                >
                  Drift
                </p>
              </div>
            )}
          </div>

          {/* Step list */}
          <div className="p-4 flex-1">
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.25em",
                color: "var(--ochre)",
              }}
              className="uppercase mb-3"
            >
              Steps
            </p>
            {steps.map((step, i) => (
              <div
                key={i}
                className="mb-2 pb-2"
                style={{ borderBottom: "1px solid var(--coolstone)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 9,
                      color: "var(--taupe)",
                      width: 16,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 13,
                      color: "var(--mahogany)",
                      fontWeight: 500,
                    }}
                  >
                    {step.bearing}° · {step.distance}m
                  </span>
                </div>
                {step.label && (
                  <p
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 12,
                      color: "var(--ochre)",
                      fontStyle: "italic",
                      marginLeft: 22,
                      marginTop: 1,
                    }}
                  >
                    {step.label}
                  </p>
                )}
                {step.description && (
                  <p
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 12,
                      color: "var(--taupe)",
                      marginLeft: 22,
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div
            className="p-4"
            style={{ borderTop: "2px solid var(--mahogany)" }}
          >
            <button
              onClick={handleFork}
              disabled={forking || deleting}
              className="btn-stamp w-full py-2.5 mb-2"
              style={{
                background: "var(--mahogany)",
                border: "2px solid var(--ink)",
                color: "var(--parchment)",
                boxShadow: "4px 4px 0px var(--ink)",
              }}
            >
              {forking ? "Forking…" : "⑂ Fork this Route"}
            </button>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting || forking}
                className="btn-stamp w-full py-2"
                style={{
                  background: "transparent",
                  border: "2px solid #7A1A1A",
                  color: "#7A1A1A",
                  boxShadow: "3px 3px 0px #3A0A0A",
                }}
              >
                {deleting ? "Deleting…" : "✕ Delete Route"}
              </button>
            )}
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 11,
                color: "var(--taupe)",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              {isOwner
                ? "Fork creates a copy. Delete is permanent."
                : user
                  ? "Fork creates a private copy you can edit."
                  : "Sign in to fork and edit this route."}
            </p>
          </div>
        </div>

        {/* Map — read-only with full popup support */}
        <div className="flex-1 relative">
          <MapView
            steps={steps}
            origin={route ? [route.origin_lat, route.origin_lng] : null}
            originMeta={originMeta}
            playIndex={steps.length}
            onMapClick={() => {}}
            isPlaying={false}
            onMarkerClick={(i) => setActiveModalIndex(i)}
            onOriginClick={() => setActiveModalIndex(-1)}
            activeModalIndex={activeModalIndex}
            onPopupClose={(i) => {
              if (activeModalIndex === i) setActiveModalIndex(null);
            }}
            timerRemaining={null}
            timerDuration={0}
          />
        </div>
      </div>
    </div>
  );
}
