import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import MapView from "../components/MapView";
import StepForm from "../components/StepForm";
import StepList from "../components/StepList";
import StatsPanel from "../components/StatsPanel";
import Controls from "../components/Controls";
import SaveRouteModal from "../components/SaveRouteModal";
import OriginForm from "../components/OriginForm";
import RouteBrowser from "../components/RouteBrowser";
import { calcStats } from "../utils/deadReckoning";
import { useAuth } from "../context/AuthContext";
import { useRouteSync } from "../hooks/useRouteSync";
import { apiFetch } from "../lib/api";
import BalangayIcon from "../assets/balangay-icon.svg";

export default function MapApp() {
  const { routeId } = useParams();
  const { user } = useAuth();

  const [steps, setSteps] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [originMeta, setOriginMeta] = useState({
    label: "",
    description: "",
    duration: 0,
    pinIcon: null,
  });
  const [originConfirmed, setOriginConfirmed] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const autoResumeRef = useRef(null);
  const timerTickRef = useRef(null);
  const timerStartRef = useRef(null);
  const timerDurationRef = useRef(0);
  const intervalRef = useRef(null);

  const stats = calcStats(steps, origin);
  const {
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
  } = useRouteSync({ steps, origin, originMeta, stats });

  const isOwner = user && savedRoute?.user_id === user.id;

  // Load route from URL param
  useEffect(() => {
    if (!routeId) return;
    loadRoute(routeId)
      .then(({ route, steps: loaded, originMeta: loadedMeta }) => {
        setOrigin([route.origin_lat, route.origin_lng]);
        setSteps(loaded);
        if (loadedMeta) setOriginMeta(loadedMeta);
        setOriginConfirmed(true);
      })
      .catch(() => {});
  }, [routeId]);

  useEffect(() => {
    setHasStarted(false);
    setPlayIndex(0);
  }, [steps.length]);

  function addStep(step) {
    setHistory((h) => [...h, steps]);
    setRedoStack([]);
    setSteps((s) => [...s, step]);
  }
  function deleteStep(index) {
    setHistory((h) => [...h, steps]);
    setRedoStack([]);
    setSteps((s) => s.filter((_, i) => i !== index));
  }
  function undoStep() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [...r, steps]);
    setSteps(prev);
    setHistory((h) => h.slice(0, -1));
  }
  function redoStep() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, steps]);
    setSteps(next);
    setRedoStack((r) => r.slice(0, -1));
  }
  function resetAll() {
    clearInterval(intervalRef.current);
    clearTimeout(autoResumeRef.current);
    clearInterval(timerTickRef.current);
    setSteps([]);
    setHistory([]);
    setRedoStack([]);
    setOrigin(null);
    setOriginMeta({ label: "", description: "", duration: 0, pinIcon: null });
    setOriginConfirmed(false);
    setPlayIndex(0);
    setIsPlaying(false);
    setHasStarted(false);
    setActiveModalIndex(null);
    setPausedByUser(false);
    setTimerRemaining(null);
  }

  function startAutoTimer(seconds, onComplete) {
    clearTimeout(autoResumeRef.current);
    clearInterval(timerTickRef.current);
    timerDurationRef.current = seconds;
    timerStartRef.current = Date.now();
    setTimerRemaining(seconds);
    timerTickRef.current = setInterval(() => {
      const elapsed = (Date.now() - timerStartRef.current) / 1000;
      const remaining = Math.max(0, seconds - elapsed);
      setTimerRemaining(parseFloat(remaining.toFixed(1)));
    }, 100);
    autoResumeRef.current = setTimeout(() => {
      clearInterval(timerTickRef.current);
      setTimerRemaining(null);
      onComplete();
    }, seconds * 1000);
  }

  function pauseAutoTimer() {
    clearTimeout(autoResumeRef.current);
    clearInterval(timerTickRef.current);
    const elapsed = (Date.now() - timerStartRef.current) / 1000;
    const remaining = Math.max(0, timerDurationRef.current - elapsed);
    setTimerRemaining(parseFloat(remaining.toFixed(1)));
    return remaining;
  }

  function openStepPopup(stepIndex, { keepPlaying = false } = {}) {
    const step =
      stepIndex === -1
        ? { ...originMeta, bearing: null, distance: null }
        : steps[stepIndex];
    if (!step) return;
    setActiveModalIndex(stepIndex);
    if (step.duration > 0) {
      setIsPlaying(true);
      setPausedByUser(false);
      startAutoTimer(step.duration, () => {
        setActiveModalIndex(null);
        setTimerRemaining(null);
        startInterval(stepIndex === -1 ? 0 : stepIndex + 1);
      });
    } else {
      setIsPlaying(false);
      setPausedByUser(true);
    }
  }

  function startInterval(fromIndex) {
    clearInterval(intervalRef.current);
    setIsPlaying(true);
    setPausedByUser(false);
    intervalRef.current = setInterval(() => {
      setPlayIndex((i) => {
        const next = i + 1;
        if (next > steps.length) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return steps.length;
        }
        const arrivedStep = steps[next - 1];
        if (arrivedStep?.description || arrivedStep?.imageUrl) {
          clearInterval(intervalRef.current);
          openStepPopup(next - 1, { keepPlaying: true });
        }
        return next;
      });
    }, 600);
  }

  function handlePlay() {
    if (!steps.length) return;
    setHasStarted(true);
    if (originMeta.description && playIndex === 0) {
      setPlayIndex(0);
      openStepPopup(-1, { keepPlaying: true });
      return;
    }
    const startIndex = playIndex >= steps.length ? 0 : playIndex;
    if (startIndex === 0) setPlayIndex(0);
    const firstStep = steps[startIndex];
    if (startIndex === 0 && (firstStep?.description || firstStep?.imageUrl)) {
      setPlayIndex(1);
      openStepPopup(0, { keepPlaying: true });
      return;
    }
    startInterval(startIndex);
  }

  function handlePause() {
    if (activeModalIndex !== null && timerRemaining !== null) {
      pauseAutoTimer();
      setIsPlaying(false);
      setPausedByUser(true);
    } else {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setPausedByUser(true);
    }
  }

  function handleResume() {
    if (activeModalIndex !== null && timerRemaining !== null) {
      const remaining = timerRemaining;
      const stepIndex = activeModalIndex;
      setIsPlaying(true);
      setPausedByUser(false);
      startAutoTimer(remaining, () => {
        setActiveModalIndex(null);
        setTimerRemaining(null);
        startInterval(stepIndex === -1 ? 0 : stepIndex + 1);
      });
    } else if (activeModalIndex !== null) {
      setActiveModalIndex(null);
      setPausedByUser(false);
      startInterval(playIndex);
    } else {
      setPausedByUser(false);
      startInterval(playIndex);
    }
  }

  function handleLoadRoute(route) {
    resetAll();
    setTimeout(() => {
      setOrigin(route.origin);
      setOriginMeta(route.originMeta);
      setSteps(route.steps);
      setOriginConfirmed(true);
    }, 50);
  }

  async function handleDeleteRoute() {
    if (!savedRoute?.id) return;
    if (!confirm(`Delete "${savedRoute.title}"? This cannot be undone.`))
      return;
    setDeleting(true);
    try {
      await apiFetch(`/api/routes/${savedRoute.id}`, { method: "DELETE" });
      clearSavedRoute?.();
      resetAll();
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setDeleting(false);
    }
  }

  function handleMapClick(latlng) {
    if (!origin && !originConfirmed) setOrigin(latlng);
  }

  const handleMarkerClick = useCallback(
    (index) => {
      if (isPlaying && !pausedByUser) return;
      setActiveModalIndex(index);
      setPausedByUser(false);
      setTimerRemaining(null);
    },
    [steps, isPlaying, pausedByUser],
  );

  const handleOriginClick = useCallback(() => {
    if (isPlaying && !pausedByUser) return;
    setActiveModalIndex(-1);
    setPausedByUser(false);
    setTimerRemaining(null);
  }, [isPlaying, pausedByUser]);

  const handlePopupClose = useCallback(
    (index) => {
      if (activeModalIndex === index) {
        clearTimeout(autoResumeRef.current);
        clearInterval(timerTickRef.current);
        setActiveModalIndex(null);
        setTimerRemaining(null);
        if (!pausedByUser) setPausedByUser(true);
        setIsPlaying(false);
      }
    },
    [activeModalIndex, pausedByUser],
  );

  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoStep();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redoStep();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [steps, history, redoStack]);

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;
  const visibleIndex = hasStarted ? playIndex : steps.length;
  const showPause = isPlaying && !pausedByUser;
  const showResume = !isPlaying || pausedByUser;
  const isResume = hasStarted && (playIndex > 0 || pausedByUser);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div
        className="w-80 flex flex-col z-10 overflow-hidden flex-shrink-0"
        style={{
          background: "var(--linen)",
          borderRight: "2px solid var(--mahogany)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{
            background: "var(--mahogany)",
            borderBottom: "2px solid var(--ink)",
          }}
        >
          <div>
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
              <img
                src={BalangayIcon}
                alt=""
                style={{
                  width: 20,
                  height: 20,
                }}
              />
              Balangay
            </Link>
            <p
              style={{
                color: "var(--sand)",
                fontSize: 12,
                fontFamily: "EB Garamond, serif",
                fontStyle: "italic",
              }}
              className="mt-0.5"
            >
              {!origin
                ? "Click map to place start pin"
                : !originConfirmed
                  ? "Fill in details, then confirm"
                  : `${steps.length} step${steps.length !== 1 ? "s" : ""} plotted`}
            </p>
          </div>

          {user &&
            originConfirmed &&
            steps.length > 0 &&
            (atRouteLimit ? (
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 7,
                  letterSpacing: "0.15em",
                  color: "#7A1A1A",
                  border: "1px solid #7A1A1A",
                  padding: "3px 6px",
                }}
                className="uppercase shrink-0"
              >
                Limit reached
              </span>
            ) : (
              <button
                onClick={() => setShowSave(true)}
                className="btn-stamp px-3 py-1.5"
                style={{
                  background: "var(--parchment)",
                  border: "2px solid var(--ink)",
                  color: "var(--ink)",
                  boxShadow: "2px 2px 0px var(--ink)",
                  fontSize: 9,
                }}
              >
                {savedRoute?.id ? "Update" : "Save"}
              </button>
            ))}
        </div>

        {/* Anon nudge */}
        {!user && originConfirmed && steps.length > 0 && (
          <div
            className="px-4 py-2 flex-shrink-0"
            style={{
              background: "var(--mapfade)",
              borderBottom: "1px solid var(--coolstone)",
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
              <Link
                to="/auth"
                style={{ color: "var(--ochre)", textDecoration: "underline" }}
              >
                Sign in
              </Link>{" "}
              to save and share this route.
            </p>
          </div>
        )}

        {/* Saved route bar */}
        {savedRoute?.id && (
          <div
            className="px-4 py-2 flex items-center justify-between flex-shrink-0"
            style={{
              background: "var(--mapfade)",
              borderBottom: "1px solid var(--coolstone)",
            }}
          >
            <span
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 13,
                color: "var(--ochre)",
                fontStyle: "italic",
              }}
              className="truncate flex-1 mr-3"
            >
              {savedRoute.title}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {isOwner && (
                <button
                  onClick={togglePublic}
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 8,
                    letterSpacing: "0.15em",
                    color: savedRoute.is_public
                      ? "var(--moss)"
                      : "var(--taupe)",
                  }}
                  className="uppercase hover:opacity-70 transition-opacity"
                >
                  {savedRoute.is_public ? "Public" : "Private"}
                </button>
              )}
              {isOwner && (
                <button
                  onClick={handleDeleteRoute}
                  disabled={deleting}
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 9,
                    color: "#7A1A1A",
                    letterSpacing: "0.1em",
                  }}
                  className="uppercase hover:opacity-70 transition-opacity disabled:opacity-30"
                >
                  {deleting ? "Deleting…" : "✕ Delete"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STATE 1: No origin */}
        {!origin && (
          <div
            className="flex-1 flex flex-col items-center justify-center px-6 gap-5"
            style={{ background: "var(--cream)" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "2.5px solid #3D5A2E",
                background: "#F5EDD6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              📍
            </div>
            <div className="text-center">
              <p
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "var(--mahogany)",
                }}
                className="uppercase font-bold mb-2"
              >
                Set your start pin
              </p>
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 14,
                  color: "var(--taupe)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                Click anywhere on the map to place your starting point, then
                fill in the details.
              </p>
            </div>
            <div
              className="w-full pt-3"
              style={{ borderTop: "1px solid var(--coolstone)" }}
            >
              <button
                onClick={() => setShowBrowser(true)}
                className="w-full btn-stamp py-2.5"
                style={{
                  background: "var(--mahogany)",
                  border: "2px solid var(--ink)",
                  color: "var(--parchment)",
                  boxShadow: "3px 3px 0px var(--ink)",
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                }}
              >
                Browse Routes
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: Origin placed, awaiting confirmation */}
        {origin && !originConfirmed && (
          <OriginForm
            value={originMeta}
            onChange={setOriginMeta}
            onConfirm={() => setOriginConfirmed(true)}
            disabled={false}
          />
        )}

        {/* STATE 3: Confirmed — StepForm + Controls */}
        {origin && originConfirmed && (
          <>
            <div className="flex-1 overflow-y-auto">
              <StepForm
                onAddStep={addStep}
                disabled={isPlaying && !pausedByUser}
              />
            </div>
            <Controls
              isPlaying={showPause}
              canUndo={canUndo}
              canRedo={canRedo}
              steps={steps}
              origin={origin}
              playIndex={playIndex}
              isResume={isResume}
              onPlay={
                showResume
                  ? pausedByUser
                    ? handleResume
                    : handlePlay
                  : undefined
              }
              onPause={showPause ? handlePause : undefined}
              onReset={resetAll}
              onUndo={undoStep}
              onRedo={redoStep}
              onBrowseRoutes={() => setShowBrowser(true)}
            />
          </>
        )}
      </div>

      {/* ── MAP AREA ── */}
      <div className="flex-1 relative">
        <MapView
          steps={steps}
          origin={origin}
          originMeta={originMeta}
          playIndex={visibleIndex}
          onMapClick={handleMapClick}
          isPlaying={isPlaying}
          onMarkerClick={handleMarkerClick}
          onOriginClick={handleOriginClick}
          activeModalIndex={activeModalIndex}
          onPopupClose={handlePopupClose}
          timerRemaining={timerRemaining}
          timerDuration={timerDurationRef.current}
        />

        <StatsPanel steps={steps} origin={origin} />

        {steps.length > 0 && (
          <StepList
            steps={steps}
            onDelete={deleteStep}
            disabled={isPlaying && !pausedByUser}
            activeModalIndex={activeModalIndex}
            onStepClick={(i) => {
              if (!isPlaying || pausedByUser) setActiveModalIndex(i);
            }}
          />
        )}

        {activeModalIndex !== null && (
          <button
            onClick={pausedByUser ? handleResume : handlePause}
            className="btn-stamp px-8 py-2.5 absolute"
            style={{
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              background: pausedByUser ? "var(--mahogany)" : "var(--gold)",
              border: "2px solid var(--ink)",
              color: pausedByUser ? "var(--parchment)" : "var(--ink)",
              boxShadow: "4px 4px 0px var(--ink)",
              zIndex: 1000,
              fontFamily: "Cinzel, serif",
              fontSize: 10,
              letterSpacing: "0.18em",
            }}
          >
            {pausedByUser ? "▶ RESUME PLAYBACK" : "⏸ PAUSE"}
          </button>
        )}
      </div>

      {showBrowser && (
        <RouteBrowser
          onLoad={handleLoadRoute}
          onClose={() => setShowBrowser(false)}
        />
      )}

      {showSave && (
        <SaveRouteModal
          savedRoute={savedRoute}
          saving={saving}
          saveError={saveError}
          onClose={() => setShowSave(false)}
          onSave={async (title, desc, isPublic) => {
            const route = await saveRoute(title, desc, isPublic);
            if (route) setShowSave(false);
          }}
        />
      )}
    </div>
  );
}
