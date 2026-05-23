import { useState } from "react";
import { parseBearing } from "../utils/deadReckoning";

export default function StepForm({ onAddStep, disabled }) {
  const [bearing, setBearing] = useState("");
  const [distance, setDistance] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState(null);

  function handleAdd() {
    const b = parseBearing(bearing);
    const d = parseFloat(distance);
    if (isNaN(b) || b < 0 || b > 360) {
      setError("Direction must be 0–360 or a cardinal (N, NE, E, ...)");
      return;
    }
    if (isNaN(d) || d <= 0 || d >= 50000) {
      setError("Distance must be between 1 and 50000 metres");
      return;
    }
    setError(null);
    onAddStep({ bearing: b, distance: d, label });
    setBearing("");
    setDistance("");
    setLabel("");
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-gray-200">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        Add Step
      </h2>
      <input
        type="text"
        placeholder="Direction: 90 or NE"
        value={bearing}
        onChange={(e) => setBearing(e.target.value)}
        disabled={disabled}
        className="border rounded px-2 py-1 text-sm disabled:opacity-50"
      />
      <input
        type="number"
        placeholder="Distance (metres)"
        min="1"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        disabled={disabled}
        className="border rounded px-2 py-1 text-sm disabled:opacity-50"
      />
      <input
        type="text"
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={disabled}
        className="border rounded px-2 py-1 text-sm disabled:opacity-50"
      />
      <button
        onClick={handleAdd}
        disabled={disabled}
        className="bg-blue-600 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        Add Step
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
