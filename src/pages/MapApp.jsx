import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
  const [pausedForModal, setPausedForModal] = useState(false);
  const autoResumeRef = useRef(null);
  const intervalRef = useRef(null);

  const stats = calcStats(steps, origin);
  const { savedRoute, saving, saveError, saveRoute, loadRoute, togglePublic } =
    useRouteSync({ steps, origin, stats });

  // Load from URL param
  useEffect(() => {
    if (!routeId) return;
    loadRoute(routeId)
      .then(({ route, steps: loaded }) => {
        setOrigin([route.origin_lat, route.origin_lng]);
        setSteps(loaded);
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
    setPausedForModal(false);
  }

  // Load a seeded route object — replaces handleLoadPreset entirely
  function handleLoadRoute(route) {
    resetAll();
    setTimeout(() => {
      setOrigin(route.origin);
      setOriginMeta(route.originMeta);
      setSteps(route.steps);
      setOriginConfirmed(true);
    }, 50);
  }

  function openStepPopup(stepIndex) {
    const step =
      stepIndex === -1
        ? { ...originMeta, bearing: null, distance: null }
        : steps[stepIndex];
    if (!step) return;
    setActiveModalIndex(stepIndex);
    setPausedForModal(true);
    if (step.duration > 0) {
      clearTimeout(autoResumeRef.current);
      autoResumeRef.current = setTimeout(() => {
        setActiveModalIndex(null);
        setPausedForModal(false);
        startInterval(stepIndex === -1 ? 0 : stepIndex + 1);
      }, step.duration * 1000);
    }
  }

  function startInterval(fromIndex) {
    clearInterval(intervalRef.current);
    setIsPlaying(true);
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
          setIsPlaying(false);
          openStepPopup(next - 1);
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
      openStepPopup(-1);
      return;
    }
    const startIndex = playIndex >= steps.length ? 0 : playIndex;
    if (startIndex === 0) setPlayIndex(0);
    const firstStep = steps[startIndex];
    if (startIndex === 0 && (firstStep?.description || firstStep?.imageUrl)) {
      setPlayIndex(1);
      openStepPopup(0);
      return;
    }
    startInterval(startIndex);
  }

  function handlePause() {
    clearInterval(intervalRef.current);
    clearTimeout(autoResumeRef.current);
    setIsPlaying(false);
    setPausedForModal(false);
  }

  function handleResume() {
    clearTimeout(autoResumeRef.current);
    const fromIndex = activeModalIndex === -1 ? 0 : playIndex;
    setActiveModalIndex(null);
    setPausedForModal(false);
    startInterval(fromIndex);
  }

  function handleMapClick(latlng) {
    if (!origin && !originConfirmed) setOrigin(latlng);
  }

  const handleMarkerClick = useCallback(
    (index) => {
      if (isPlaying) return;
      setActiveModalIndex(index);
      setPausedForModal(false);
    },
    [steps, isPlaying],
  );

  const handleOriginClick = useCallback(() => {
    if (isPlaying) return;
    setActiveModalIndex(-1);
    setPausedForModal(false);
  }, [isPlaying]);

  const handlePopupClose = useCallback(
    (index) => {
      if (activeModalIndex === index) {
        setActiveModalIndex(null);
        setPausedForModal(false);
      }
    },
    [activeModalIndex],
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

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <div
        className="w-80 flex flex-col z-10 overflow-hidden shrink-0"
        style={{
          background: "var(--linen)",
          borderRight: "2px solid var(--mahogany)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{
            background: "var(--mahogany)",
            borderBottom: "2px solid var(--ink)",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Cinzel, serif",
                letterSpacing: "0.15em",
                color: "var(--parchment)",
                fontSize: 14,
              }}
              className="font-bold uppercase"
            >
              ⚓ Balangay
            </h1>
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
          {user && originConfirmed && steps.length > 0 && (
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
          )}
        </div>

        {/* Saved route bar */}
        {savedRoute?.id && (
          <div
            className="px-4 py-2 flex items-center justify-between shrink-0"
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
              className="truncate flex-1"
            >
              {savedRoute.title}
            </span>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <button
                onClick={togglePublic}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 8,
                  letterSpacing: "0.15em",
                  color: savedRoute.is_public ? "var(--moss)" : "var(--taupe)",
                }}
                className="uppercase hover:opacity-70 transition-opacity"
              >
                {savedRoute.is_public ? "Public" : "Private"}
              </button>
              <button
                onClick={async () => {
                  if (
                    !confirm(
                      `Delete "${savedRoute.title}"? This cannot be undone.`,
                    )
                  )
                    return;
                  try {
                    await apiFetch(`/api/routes/${savedRoute.id}`, {
                      method: "DELETE",
                    });
                    resetAll();
                  } catch (e) {
                    alert("Delete failed: " + e.message);
                  }
                }}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  color: "#7A1A1A",
                  letterSpacing: "0.1em",
                }}
                className="uppercase hover:opacity-70 transition-opacity"
              >
                ✕ Delete
              </button>
            </div>
          </div>
        )}

        {/* STATE 1: No origin — placeholder */}
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
                ⚓ Browse Routes
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: Origin placed, awaiting confirmation — OriginForm */}
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
              <StepForm onAddStep={addStep} disabled={isPlaying} />
            </div>
            <Controls
              isPlaying={isPlaying}
              canUndo={canUndo}
              canRedo={canRedo}
              steps={steps}
              origin={origin}
              playIndex={playIndex}
              onPlay={handlePlay}
              onPause={handlePause}
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
        />

        <StatsPanel steps={steps} origin={origin} />

        {steps.length > 0 && (
          <StepList
            steps={steps}
            onDelete={deleteStep}
            disabled={isPlaying}
            activeModalIndex={activeModalIndex}
            onStepClick={(i) => {
              if (!isPlaying) setActiveModalIndex(i);
            }}
          />
        )}

        {pausedForModal && (
          <button
            onClick={handleResume}
            className="btn-stamp px-8 py-2.5 absolute"
            style={{
              bottom: 28,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--mahogany)",
              border: "2px solid var(--ink)",
              color: "var(--parchment)",
              boxShadow: "4px 4px 0px var(--ink)",
              zIndex: 1000,
              fontFamily: "Cinzel, serif",
              fontSize: 10,
              letterSpacing: "0.18em",
            }}
          >
            ▶ RESUME PLAYBACK
          </button>
        )}
      </div>

      {/* Route Browser modal */}
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
