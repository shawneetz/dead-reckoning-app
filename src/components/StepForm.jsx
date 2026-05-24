import { useState } from "react";
import { parseBearing } from "../utils/deadReckoning";
import PinPicker from "./PinPicker";

export default function StepForm({ onAddStep, disabled }) {
  const [bearing, setBearing] = useState("");
  const [distance, setDistance] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [pinIcon, setPinIcon] = useState(null);
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
    const dur = duration ? parseInt(duration, 10) : 0;
    setError(null);
    onAddStep({
      bearing: b,
      distance: d,
      label,
      description,
      duration: dur > 0 ? dur : 0,
      pinIcon,
    });
    setBearing("");
    setDistance("");
    setLabel("");
    setDescription("");
    setDuration("");
    setPinIcon(null);
  }

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      style={{ borderBottom: "2px solid var(--mahogany)" }}
    >
      <p
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "var(--ochre)",
        }}
        className="uppercase"
      >
        Plot Step
      </p>

      {/* Bearing + Distance side by side */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.18em",
              color: "var(--ochre)",
            }}
            className="uppercase block mb-1"
          >
            Bearing
          </label>
          <input
            type="text"
            placeholder="90 or NE"
            value={bearing}
            onChange={(e) => setBearing(e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.18em",
              color: "var(--ochre)",
            }}
            className="uppercase block mb-1"
          >
            Distance (m)
          </label>
          <input
            type="number"
            placeholder="metres"
            min="1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 8,
            letterSpacing: "0.18em",
            color: "var(--ochre)",
          }}
          className="uppercase block mb-1"
        >
          Label
        </label>
        <input
          type="text"
          placeholder="Short name for this step"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 8,
            letterSpacing: "0.18em",
            color: "var(--ochre)",
          }}
          className="uppercase block mb-1"
        >
          Description
        </label>
        <textarea
          placeholder="Context shown in popup during playback (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          rows={2}
          style={{ resize: "none", fontSize: 13 }}
        />
      </div>

      {/* Duration — only shown when description is filled */}
      {description.trim() && (
        <div>
          <label
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.18em",
              color: "var(--ochre)",
            }}
            className="uppercase block mb-1"
          >
            Auto-close (seconds, 0 = manual)
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            max="60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}

      <div>
        <label
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 8,
            letterSpacing: "0.18em",
            color: "var(--ochre)",
          }}
          className="uppercase block mb-1"
        >
          Pin Style
        </label>
        <PinPicker value={pinIcon} onChange={setPinIcon} disabled={disabled} />
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="btn-stamp py-2.5"
        style={{
          background: "var(--mahogany)",
          border: "2px solid var(--ink)",
          color: "var(--parchment)",
          boxShadow: "3px 3px 0px var(--ink)",
        }}
      >
        + Add Step
      </button>

      {error && (
        <p
          style={{
            color: "#7A1A1A",
            fontFamily: "EB Garamond, serif",
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
