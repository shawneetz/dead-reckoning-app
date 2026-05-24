import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BalangayIcon from "../assets/balangay-icon.svg";

function RouteCard({ route }) {
  const drift = route.drift_pct != null ? parseFloat(route.drift_pct) : null;
  const driftColor =
    drift == null
      ? "var(--taupe)"
      : drift > 40
        ? "#7A1A1A"
        : drift > 10
          ? "var(--gold)"
          : "var(--moss)";

  return (
    <Link
      to={`/r/${route.id}`}
      className="block hover:opacity-90 transition-opacity"
      style={{
        background: "var(--parchment)",
        border: "2px solid var(--mahogany)",
        boxShadow: "3px 3px 0px var(--mahogany)",
      }}
    >
      <div className="p-4">
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 12,
            color: "var(--ink)",
            letterSpacing: "0.05em",
          }}
          className="font-bold uppercase truncate mb-1"
        >
          {route.title}
        </h3>
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
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    apiFetch(`/api/profiles/${username}`)
      .then((data) => {
        setProfile(data);
        setRoutes(data.routes || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  const isOwnProfile =
    currentUser &&
    profile &&
    (currentUser.id === profile.id ||
      currentUser.email?.split("@")[0] === username);

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
          }}
          className="font-bold uppercase"
        >
          <img src={BalangayIcon} alt="" style={{ width: 18, height: 18 }} />
          Balangay{" "}
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
            className="uppercase hover:text-[#F5EDD6] transition-colors"
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
          className="mb-8"
        />

        {/* Routes */}
        <div className="mb-4 flex items-center justify-between">
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "var(--ochre)",
            }}
            className="uppercase font-bold"
          >
            Public Routes ({routes.length})
          </p>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-16">
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 15,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              {isOwnProfile
                ? "You haven't published any routes yet."
                : "No public routes yet."}
            </p>
            {isOwnProfile && (
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
            {routes.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
