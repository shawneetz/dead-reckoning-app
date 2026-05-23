export default function Controls({
  isPlaying,
  canUndo,
  canRedo,
  steps,
  origin,
  onPlay,
  onPause,
  onReset,
  onUndo,
  onRedo,
  onLoadPreset,
}) {
  return (
    <div className="flex flex-col gap-2 p-3 border-t border-gray-200">
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 text-xs border rounded px-2 py-1 disabled:opacity-30 hover:bg-gray-100"
        >
          ↩ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 text-xs border rounded px-2 py-1 disabled:opacity-30 hover:bg-gray-100"
        >
          ↪ Redo
        </button>
      </div>

      <div className="flex gap-1">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            disabled={!steps.length}
            className="flex-1 text-xs bg-green-600 text-white rounded px-2 py-1 disabled:opacity-30 hover:bg-green-700"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 text-xs bg-yellow-500 text-white rounded px-2 py-1 hover:bg-yellow-600"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={onReset}
          className="flex-1 text-xs bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
        >
          ✕ Reset
        </button>
      </div>

      <select
        onChange={(e) => {
          if (e.target.value) onLoadPreset(e.target.value);
        }}
        className="text-xs border rounded px-2 py-1"
        defaultValue=""
      >
        <option value="">— Load Preset —</option>
        <option value="UPLB Campus Walk">UPLB Campus Walk</option>
        <option value="Rizal Park Manila Loop">Rizal Park Manila Loop</option>
        <option value="Bataan Death March Segment">
          Bataan Death March Segment
        </option>
      </select>
    </div>
  );
}
