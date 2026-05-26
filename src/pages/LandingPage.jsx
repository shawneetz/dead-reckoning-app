import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BalangayIcon from "../assets/balangay-icon.svg";

const PRESETS = [
  {
    name: "UPLB Campus Walk",
    origin: "Los Baños, Laguna",
    steps: 8,
    drift: "97.3",
  },
  {
    name: "Austronesian Crossing",
    origin: "Orchid Island, Taiwan",
    steps: 5,
    drift: "2.1",
  },
  {
    name: "Bataan Death March",
    origin: "Mariveles, Bataan",
    steps: 8,
    drift: "0.8",
  },
];

export default function LandingPage() {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
        {/* Brand */}
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
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Explore — always visible */}
          <Link
            to="/gallery"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "var(--sand)",
              padding: "6px 12px",
            }}
            className="uppercase hover:text-[#F5EDD6] hover:bg-white/10 transition-all"
          >
            Explore
          </Link>

          {user ? (
            <>
              {/* Profile link */}
              <Link
                to={profile?.username ? `/u/${profile.username}` : "#"}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: profile?.username ? "var(--sand)" : "var(--taupe)",
                  pointerEvents: profile?.username ? "auto" : "none",
                  padding: "6px 12px",
                }}
                className="uppercase hover:text-[#F5EDD6] hover:bg-white/10 transition-all"
              >
                {profile?.username ? profile.username : "…"}
              </Link>

              {/* Divider */}
              <div
                style={{
                  width: 1,
                  height: 16,
                  background: "rgba(255,255,255,0.2)",
                  margin: "0 4px",
                }}
              />

              {/* Primary CTA */}
              <Link
                to="/app"
                className="btn-stamp px-4 py-1.5"
                style={{
                  background: "var(--parchment)",
                  border: "2px solid var(--ink)",
                  color: "var(--ink)",
                  boxShadow: "2px 2px 0px var(--ink)",
                  fontSize: 9,
                }}
              >
                Open Chart
              </Link>

              {/* Sign out — subtle */}
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(216,197,167,0.6)",
                  padding: "6px 8px",
                }}
                className="uppercase hover:text-[#F5EDD6] transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--sand)",
                  padding: "6px 12px",
                }}
                className="uppercase hover:text-[#F5EDD6] hover:bg-white/10 transition-all"
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
                  boxShadow: "2px 2px 0px var(--ink)",
                  fontSize: 9,
                }}
              >
                Try It Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1
          style={{
            fontFamily: "Cinzel, serif",
            color: "var(--ink)",
            lineHeight: 1.2,
            letterSpacing: "0.08em",
          }}
          className="text-6xl md:text-7xl font-bold mb-4 uppercase"
        >
          Balangay
        </h1>
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 12,
            letterSpacing: "0.25em",
            color: "var(--mahogany)",
          }}
          className="uppercase mb-8"
        >
          Dead Reckoning Interactive Simulation
        </p>

        <div
          style={{ borderTop: "3px double var(--leather)" }}
          className="my-8 mx-auto w-32"
        />

        <p
          style={{
            color: "var(--mahogany)",
            fontFamily: "EB Garamond, serif",
            fontSize: 18,
          }}
          className="max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Austronesian sailors crossed the Pacific using only bearing and
          distance. No instruments. No landmarks. Plot their routes and see how
          far off course a single wrong step takes you.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/app"
            className="btn-stamp px-8 py-3"
            style={{
              background: "var(--mahogany)",
              border: "2px solid var(--ink)",
              color: "var(--parchment)",
              boxShadow: "4px 4px 0px var(--ink)",
            }}
          >
            Open the Chart
          </Link>
          <Link
            to="/gallery"
            className="btn-stamp px-8 py-3"
            style={{
              background: "transparent",
              border: "2px solid var(--gold)",
              color: "var(--mahogany)",
              boxShadow: "3px 3px 0px var(--gold)",
            }}
          >
            Browse Routes
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div
        style={{ borderTop: "1px solid var(--coolstone)" }}
        className="mx-6"
      />

      {/* Preset cards */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "var(--mahogany)",
          }}
          className="uppercase mb-8 font-bold"
        >
          Sample Routes
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {PRESETS.map((p) => (
            <div
              key={p.name}
              style={{
                background: "var(--parchment)",
                border: "2px solid var(--mahogany)",
                boxShadow: "4px 4px 0px var(--mahogany)",
              }}
              className="p-5"
            >
              <p
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--ochre)",
                }}
                className="uppercase mb-1"
              >
                {p.origin}
              </p>
              <h3
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "var(--ink)",
                  fontSize: 13,
                }}
                className="font-bold mb-3 leading-tight uppercase"
              >
                {p.name}
              </h3>
              <div
                style={{ borderTop: "1px solid var(--coolstone)" }}
                className="flex justify-between text-xs pt-3"
              >
                <span
                  style={{
                    color: "var(--ochre)",
                    fontFamily: "EB Garamond, serif",
                    fontSize: 13,
                  }}
                >
                  {p.steps} steps
                </span>
                <span
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color:
                      parseFloat(p.drift) > 40
                        ? "#7A1A1A"
                        : parseFloat(p.drift) > 5
                          ? "var(--gold)"
                          : "var(--moss)",
                  }}
                >
                  {p.drift}% drift
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/app"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--mahogany)",
            }}
            className="uppercase hover:opacity-70 transition-opacity font-bold"
          >
            Load any preset inside the app →
          </Link>
        </div>
      </section>
    </div>
  );
}
