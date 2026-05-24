import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BalangayIcon from "../assets/balangay-icon.svg";

function DriftBadge({ drift }) {
  if (drift == null) return null;
  const val = parseFloat(drift);
  const color = val > 40 ? "#7A1A1A" : val > 10 ? "var(--gold)" : "var(--moss)";
  return (
    <span
      style={{
        fontFamily: "EB Garamond, serif",
        fontSize: 14,
        fontWeight: 500,
        color,
      }}
    >
      {val.toFixed(1)}% drift
    </span>
  );
}

function CategoryBadge({ category }) {
  if (!category) return null;
  const styles = {
    historical: { background: "var(--mahogany)", color: "var(--parchment)" },
    place: { background: "var(--moss)", color: "var(--cream)" },
  };
  const labels = { historical: "Historical", place: "Place" };
  const s = styles[category] || {};
  return (
    <span
      style={{
        fontFamily: "Cinzel, serif",
        fontSize: 7,
        letterSpacing: "0.2em",
        padding: "2px 8px",
        ...s,
      }}
      className="uppercase"
    >
      {labels[category] || category}
    </span>
  );
}

function RouteCard({ route }) {
  return (
    <Link
      to={`/r/${route.id}`}
      className="block hover:opacity-90 transition-opacity"
      style={{
        background: "var(--parchment)",
        border: "2px solid var(--mahogany)",
        boxShadow: "4px 4px 0px var(--mahogany)",
      }}
    >
      {route.cover_image_url && (
        <img
          src={route.cover_image_url}
          alt={route.title}
          className="w-full object-cover"
          style={{
            height: 130,
            objectFit: "cover",
            borderBottom: "1px solid var(--leather)",
          }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 12,
              color: "var(--ink)",
              letterSpacing: "0.05em",
            }}
            className="font-bold uppercase leading-tight truncate"
          >
            {route.title}
          </h2>
          <CategoryBadge category={route.category} />
        </div>

        {route.description && (
          <p
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 13,
              color: "var(--ochre)",
              lineHeight: 1.45,
            }}
            className="mb-3 line-clamp-2"
          >
            {route.description}
          </p>
        )}

        <div
          style={{ borderTop: "1px solid var(--coolstone)" }}
          className="flex items-center justify-between pt-2 mt-2"
        >
          <span
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 12,
              color: "var(--taupe)",
            }}
          >
            {route.view_count ?? 0} views
            {route.fork_count > 0 && ` · ${route.fork_count} forks`}
          </span>
          <DriftBadge drift={route.drift_pct} />
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div
      className="flex items-baseline gap-4 mb-6"
      style={{
        borderBottom: "3px double var(--leather)",
        paddingBottom: "0.5rem",
      }}
    >
      <h2
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 13,
          letterSpacing: "0.2em",
          color: "var(--ink)",
        }}
        className="uppercase font-bold"
      >
        {title}
      </h2>
      {count != null && (
        <span
          style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 13,
            color: "var(--taupe)",
            fontStyle: "italic",
          }}
        >
          {count} route{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function EmptySection({ message, showCTA }) {
  return (
    <div className="py-10 text-center">
      <p
        style={{
          fontFamily: "EB Garamond, serif",
          fontSize: 15,
          color: "var(--taupe)",
          fontStyle: "italic",
        }}
        className="mb-6"
      >
        {message}
      </p>
      {showCTA && (
        <Link
          to="/app"
          className="btn-stamp px-6 py-2"
          style={{
            background: "var(--mahogany)",
            border: "2px solid var(--ink)",
            color: "var(--parchment)",
            boxShadow: "4px 4px 0px var(--ink)",
          }}
        >
          Create a Route
        </Link>
      )}
    </div>
  );
}

export default function Gallery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const TABS = [
    { id: "all", label: "All" },
    { id: "historical", label: "Historical" },
    { id: "places", label: "Places" },
    { id: "public", label: "Public" },
  ];

  useEffect(() => {
    apiFetch("/api/routes/?limit=100")
      .then(setRoutes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = routes.filter(
    (r) =>
      !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const historical = filtered.filter((r) => r.category === "historical");
  const places = filtered.filter((r) => r.category === "place");
  const publicRoutes = filtered.filter(
    (r) =>
      r.category == null ||
      (r.category !== "historical" && r.category !== "place"),
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--linen)", color: "var(--ink)" }}
    >
      {/* Nav */}
      <nav
        style={{
          background: "var(--mahogany)",
          borderBottom: "2px solid var(--ink)",
        }}
        className="flex items-center justify-between px-6 py-3"
      >
        <Link
          to="/"
          style={{
            fontFamily: "Cinzel, serif",

            letterSpacing: "0.15em",

            color: "var(--parchment)",

            fontSize: 15,

            display: "flex",

            alignItems: "center",

            gap: 8,
          }}
          className="font-bold uppercase"
        >
          <img src={BalangayIcon} alt="" style={{ width: 20, height: 20 }} />
          Balangay
        </Link>{" "}
        <div className="flex gap-5 items-center">
          {user ? (
            <>
              <Link
                to={`/u/${user.user_metadata?.preferred_username || user.email?.split("@")[0]}`}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "var(--sand)",
                }}
                className="uppercase hover:text-[#F5EDD6] transition-colors"
              >
                My Profile
              </Link>
              <Link
                to="/app"
                className="btn-stamp px-4 py-1.5"
                style={{
                  background: "var(--parchment)",
                  border: "2px solid var(--ink)",
                  color: "var(--ink)",
                  boxShadow: "3px 3px 0px var(--ink)",
                }}
              >
                New Route
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "var(--sand)",
                }}
                className="uppercase hover:text-[#F5EDD6] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/app"
                className="btn-stamp px-4 py-1.5"
                style={{
                  background: "var(--parchment)",
                  border: "2px solid var(--ink)",
                  color: "var(--ink)",
                  boxShadow: "3px 3px 0px var(--ink)",
                }}
              >
                Try It
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 22,
                color: "var(--ink)",
                letterSpacing: "0.08em",
              }}
              className="font-bold uppercase mb-1"
            >
              Public Routes
            </h1>
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 15,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              Historical navigations, notable places, and routes from Balangay
              sailors
            </p>
          </div>
          <input
            type="text"
            placeholder="Search routes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 220,
              fontFamily: "EB Garamond, serif",
              background: "var(--parchment)",
              border: "1.5px solid var(--taupe)",
              color: "var(--ink)",
              padding: "6px 10px",
              fontSize: 14,
            }}
          />
        </div>

        {/* Tabs */}
        <div
          className="flex mb-8"
          style={{
            border: "2px solid var(--mahogany)",
            background: "var(--mapfade)",
            width: "fit-content",
          }}
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2 transition-all uppercase"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.2em",
                background: tab === t.id ? "var(--mahogany)" : "transparent",
                color: tab === t.id ? "var(--parchment)" : "var(--ochre)",
                borderRight:
                  i < TABS.length - 1 ? "1px solid var(--mahogany)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <p
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 15,
              color: "var(--taupe)",
              fontStyle: "italic",
            }}
          >
            Loading routes…
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#7A1A1A",
              fontFamily: "EB Garamond, serif",
              fontSize: 14,
              fontStyle: "italic",
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* ALL tab */}
            {tab === "all" && (
              <>
                {historical.length > 0 && (
                  <div className="mb-10">
                    <SectionHeader
                      title="Historical Routes"
                      count={historical.length}
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {historical.map((r) => (
                        <RouteCard key={r.id} route={r} />
                      ))}
                    </div>
                  </div>
                )}

                {places.length > 0 && (
                  <div className="mb-10">
                    <SectionHeader title="Places" count={places.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {places.map((r) => (
                        <RouteCard key={r.id} route={r} />
                      ))}
                    </div>
                  </div>
                )}

                {publicRoutes.length > 0 && (
                  <div className="mb-10">
                    <SectionHeader
                      title="Public Routes"
                      count={publicRoutes.length}
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {publicRoutes.map((r) => (
                        <RouteCard key={r.id} route={r} />
                      ))}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && (
                  <EmptySection
                    message={
                      search
                        ? "No routes match your search."
                        : "No public routes yet."
                    }
                    showCTA={!search}
                  />
                )}
              </>
            )}

            {/* HISTORICAL tab */}
            {tab === "historical" &&
              (historical.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {historical.map((r) => (
                    <RouteCard key={r.id} route={r} />
                  ))}
                </div>
              ) : (
                <EmptySection message="No historical routes yet." />
              ))}

            {/* PLACES tab */}
            {tab === "places" &&
              (places.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {places.map((r) => (
                    <RouteCard key={r.id} route={r} />
                  ))}
                </div>
              ) : (
                <EmptySection message="No place routes yet." />
              ))}

            {/* PUBLIC tab */}
            {tab === "public" &&
              (publicRoutes.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {publicRoutes.map((r) => (
                    <RouteCard key={r.id} route={r} />
                  ))}
                </div>
              ) : (
                <EmptySection
                  message="No public routes yet. Be the first to publish one."
                  showCTA
                />
              ))}
          </>
        )}
      </main>
    </div>
  );
}
