import { useState, useRef, useEffect } from "react";
import MapView from "./components/MapView";
import StepForm from "./components/StepForm";
import StepList from "./components/StepList";
import StatsPanel from "./components/StatsPanel";
import Controls from "./components/Controls";
import { PRESETS } from "./utils/presets";

export default function App() {
  const [steps, setSteps] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

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
    setSteps([]);
    setHistory([]);
    setRedoStack([]);
    setOrigin(null);
    setPlayIndex(0);
    setIsPlaying(false);
  }

  function handlePlay() {
    if (!steps.length) return;
    // If we're resuming (playIndex is mid-way), don't reset to 0
    const startIndex = playIndex >= steps.length ? 0 : playIndex;
    setPlayIndex(startIndex);
    setIsPlaying(true);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPlayIndex((i) => {
        if (i >= steps.length) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 600);
  }

  function handlePause() {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  }

  function handleLoadPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    resetAll();
    setTimeout(() => {
      setOrigin(preset.origin);
      setSteps(preset.steps);
    }, 50);
  }

  function handleMapClick(latlng) {
    if (!origin) setOrigin(latlng);
  }

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

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex flex-col bg-white shadow-lg z-10 overflow-hidden border-r border-gray-200">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h1 className="font-bold text-gray-800 text-sm">⚓ Dead Reckoning</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {!origin
              ? "Click the map to set your start point"
              : `${steps.length} step${steps.length !== 1 ? "s" : ""} added`}
          </p>
        </div>
        <StepForm onAddStep={addStep} disabled={isPlaying || !origin} />
        <div className="flex-1 overflow-hidden">
          <StepList steps={steps} onDelete={deleteStep} disabled={isPlaying} />
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
          onLoadPreset={handleLoadPreset}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          steps={steps}
          origin={origin}
          playIndex={isPlaying ? playIndex : steps.length}
          onMapClick={handleMapClick}
          isPlaying={isPlaying}
        />{" "}
        <StatsPanel steps={steps} origin={origin} />
      </div>
    </div>
  );
}
