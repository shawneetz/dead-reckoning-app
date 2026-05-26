import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BalangayIcon from "../assets/balangay-icon.svg";

function RouteCard({ route, isPrivate, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const drift = route.drift_pct != null ? parseFloat(route.drift_pct) : null;
  const driftColor =
    drift == null
      ? "var(--taupe)"
      : drift > 40
        ? "#7A1A1A"
        : drift > 10
          ? "var(--gold)"
          : "var(--moss)";

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${route.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/routes/${route.id}`, { method: "DELETE" });
      onDelete(route.id);
    } catch (err) {
      alert("Delete failed: " + err.message);
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--parchment)",
        border: `2px solid ${isPrivate ? "var(--taupe)" : "var(--mahogany)"}`,
        boxShadow: `3px 3px 0px ${isPrivate ? "var(--coolstone)" : "var(--mahogany)"}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Clickable body */}
      <Link
        to={`/r/${route.id}`}
        className="block hover:opacity-90 transition-opacity flex-1"
      >
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 12,
                color: "var(--ink)",
                letterSpacing: "0.05em",
              }}
              className="font-bold uppercase truncate flex-1"
            >
              {route.title}
            </h3>
            {isPrivate && (
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 7,
                  letterSpacing: "0.18em",
                  color: "var(--taupe)",
                  border: "1px solid var(--coolstone)",
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
                className="uppercase"
              >
                Private
              </span>
            )}
          </div>
          {route.description && (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 13,
                color: "var(--ochre)",
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
              className="line-clamp-2 mb-2"
            >
              {route.description}
            </p>
          )}
          <div
            style={{ borderTop: "1px solid var(--coolstone)" }}
            className="flex justify-between pt-2 mt-1"
          >
            <span
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 12,
                color: "var(--taupe)",
              }}
            >
              {route.view_count ?? 0} views
            </span>
            {drift != null && (
              <span
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: driftColor,
                }}
              >
                {drift.toFixed(1)}% drift
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action footer — outside the Link so clicks don't navigate */}
      {onDelete && (
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--coolstone)" }}
        >
          <Link
            to={`/app/${route.id}`}
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.15em",
              color: "var(--ochre)",
            }}
            className="uppercase hover:opacity-70 transition-opacity"
          >
            ✎ Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="uppercase hover:opacity-70 transition-opacity disabled:opacity-30"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.15em",
              color: "#7A1A1A",
            }}
          >
            {deleting ? "Deleting…" : "✕ Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [privateRoutes, setPrivateRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("public");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    apiFetch(`/api/profiles/${username}`)
      .then((data) => {
        setProfile(data);
        setPublicRoutes(data.routes || []);
        setPrivateRoutes(data.private_routes || []);
        if (
          (data.routes || []).length === 0 &&
          (data.private_routes || []).length > 0
        ) {
          setTab("private");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  function handleDeleteRoute(routeId) {
    setPublicRoutes((prev) => prev.filter((r) => r.id !== routeId));
    setPrivateRoutes((prev) => prev.filter((r) => r.id !== routeId));
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
          Loading profile…
        </p>
      </div>
    );
  }

  if (error || !profile) {
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
          Profile not found
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

  const activeRoutes = tab === "private" ? privateRoutes : publicRoutes;

  return (
    <div className="min-h-screen" style={{ background: "var(--linen)" }}>
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
          <img src={BalangayIcon} alt="" style={{ width: 18, height: 18 }} />
          Balangay
        </Link>
        <div className="flex gap-4 items-center">
          <Link
            to="/gallery"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--sand)",
            }}
            className="uppercase hover:text-[#F5EDD6] hover:bg-white/10 px-2 py-1 rounded transition-all"
          >
            Gallery
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
            {currentUser ? "New Route" : "Try It"}
          </Link>
          {currentUser && (
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.18em",
                color: "var(--sand)",
              }}
              className="uppercase hover:text-[#F5EDD6] hover:bg-white/10 px-2 py-1 rounded transition-all"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-8">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || username}
              style={{
                width: 72,
                height: 72,
                objectFit: "cover",
                border: "2px solid var(--mahogany)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                background: "var(--parchment)",
                border: "2px solid var(--mahogany)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 24,
                  color: "var(--mahogany)",
                }}
              >
                {(profile.display_name || username || "?")[0].toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 20,
                color: "var(--ink)",
                letterSpacing: "0.08em",
              }}
              className="font-bold uppercase mb-0.5"
            >
              {profile.display_name || username}
            </h1>
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 10,
                letterSpacing: "0.15em",
                color: "var(--taupe)",
              }}
              className="uppercase mb-2"
            >
              @{profile.username}
            </p>
            {profile.bio && (
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 15,
                  color: "var(--ochre)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                {profile.bio}
              </p>
            )}
            {isOwnProfile && (
              <Link
                to="/app"
                className="btn-stamp inline-block px-4 py-1 mt-3"
                style={{
                  background: "var(--mahogany)",
                  border: "2px solid var(--ink)",
                  color: "var(--parchment)",
                  boxShadow: "3px 3px 0px var(--ink)",
                  fontSize: 9,
                }}
              >
                + New Route
              </Link>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{ borderTop: "3px double var(--leather)" }}
          className="mb-6"
        />

        {/* Tabs — owner only */}
        {isOwnProfile && (
          <div
            className="flex mb-6"
            style={{
              border: "2px solid var(--mahogany)",
              background: "var(--mapfade)",
              width: "fit-content",
            }}
          >
            <button
              onClick={() => setTab("public")}
              className="px-5 py-2 transition-all uppercase"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.2em",
                background:
                  tab === "public" ? "var(--mahogany)" : "transparent",
                color: tab === "public" ? "var(--parchment)" : "var(--ochre)",
                borderRight: "1px solid var(--mahogany)",
              }}
            >
              Public ({publicRoutes.length})
            </button>
            <button
              onClick={() => setTab("private")}
              className="px-5 py-2 transition-all uppercase"
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 9,
                letterSpacing: "0.2em",
                background:
                  tab === "private" ? "var(--mahogany)" : "transparent",
                color: tab === "private" ? "var(--parchment)" : "var(--ochre)",
              }}
            >
              Private ({privateRoutes.length})
            </button>
          </div>
        )}

        {/* Routes header for non-owners */}
        {!isOwnProfile && (
          <div className="mb-4">
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 10,
                letterSpacing: "0.25em",
                color: "var(--ochre)",
              }}
              className="uppercase font-bold"
            >
              Public Routes ({publicRoutes.length})
            </p>
          </div>
        )}

        {/* Routes grid */}
        {activeRoutes.length === 0 ? (
          <div className="text-center py-16">
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 15,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              {tab === "private"
                ? "No private routes yet."
                : isOwnProfile
                  ? "You haven't published any routes yet."
                  : "No public routes yet."}
            </p>
            {isOwnProfile && tab === "public" && (
              <Link
                to="/app"
                className="btn-stamp inline-block px-6 py-2 mt-4"
                style={{
                  background: "var(--mahogany)",
                  border: "2px solid var(--ink)",
                  color: "var(--parchment)",
                  boxShadow: "4px 4px 0px var(--ink)",
                }}
              >
                Create Your First Route
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRoutes.map((r) => (
              <RouteCard
                key={r.id}
                route={r}
                isPrivate={tab === "private"}
                onDelete={isOwnProfile ? handleDeleteRoute : null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
