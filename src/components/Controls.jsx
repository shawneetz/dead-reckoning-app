import { exportGeoJSON, captureScreenshot } from "../utils/export";

export default function Controls({
  isPlaying,
  canUndo,
  canRedo,
  steps,
  origin,
  playIndex,
  onPlay,
  onPause,
  onReset,
  onUndo,
  onRedo,
  onBrowseRoutes,
}) {
  const hasSteps = steps.length > 0 && origin;
  const isResume = playIndex > 0 && playIndex < steps.length;

  const btnBase = {
    fontFamily: "Cinzel, serif",
    fontSize: 8,
    letterSpacing: "0.15em",
    border: "1.5px solid var(--taupe)",
    background: "var(--parchment)",
    color: "var(--ink)",
    padding: "5px 0",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 shrink-0"
      style={{
        borderTop: "2px solid var(--mahogany)",
        background: "var(--linen)",
      }}
    >
      {/* Undo / Redo */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 uppercase disabled:opacity-30 hover:opacity-70"
          style={btnBase}
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 uppercase disabled:opacity-30 hover:opacity-70"
          style={btnBase}
        >
          ↪ Redo
        </button>
      </div>

      {/* Play / Pause / Reset */}
      <div className="flex gap-2">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            disabled={!hasSteps}
            className="flex-1 uppercase disabled:opacity-30 hover:opacity-80 btn-stamp"
            style={{
              ...btnBase,
              background: "var(--moss)",
              color: "var(--parchment)",
              border: "1.5px solid var(--ink)",
              boxShadow: "2px 2px 0px var(--ink)",
            }}
          >
            {isResume ? "▶ Resume" : "▶ Play"}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 uppercase hover:opacity-80 btn-stamp"
            style={{
              ...btnBase,
              background: "var(--gold)",
              color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              boxShadow: "2px 2px 0px var(--ink)",
            }}
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={onReset}
          className="flex-1 uppercase hover:opacity-80 btn-stamp"
          style={{
            ...btnBase,
            background: "transparent",
            color: "#7A1A1A",
            border: "1.5px solid #7A1A1A",
          }}
        >
          ✕ Reset
        </button>
      </div>

      {/* Browse Routes */}
      <button
        onClick={onBrowseRoutes}
        className="w-full uppercase hover:opacity-80 btn-stamp"
        style={{
          ...btnBase,
          background: "var(--linen)",
          border: "1.5px solid var(--mahogany)",
          color: "var(--mahogany)",
        }}
      >
        Browse Routes
      </button>

      {/* Export row */}
      <div className="flex gap-2">
        <button
          onClick={() => exportGeoJSON(steps, origin)}
          disabled={!hasSteps}
          className="flex-1 uppercase disabled:opacity-30 hover:opacity-70"
          style={btnBase}
        >
          ⬇ GeoJSON
        </button>
        <button
          onClick={captureScreenshot}
          disabled={!hasSteps}
          className="flex-1 uppercase disabled:opacity-30 hover:opacity-70"
          style={btnBase}
        >
          📷 Screenshot
        </button>
      </div>
    </div>
  );
}
