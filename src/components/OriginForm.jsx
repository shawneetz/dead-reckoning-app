import PinPicker from "./PinPicker";

export default function OriginForm({ value, onChange, onConfirm, disabled }) {
  function update(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-3"
      style={{ background: "var(--cream)" }}
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
        Start Pin
      </p>

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
          placeholder="Name this starting point"
          value={value.label}
          onChange={(e) => update("label", e.target.value)}
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
          placeholder="Context shown in popup when playback begins (optional)"
          value={value.description}
          onChange={(e) => update("description", e.target.value)}
          disabled={disabled}
          rows={3}
          style={{ resize: "none", fontSize: 13 }}
        />
      </div>

      {value.description?.trim() && (
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
            Popup duration (seconds, min 1)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={value.duration ?? 5}
            onChange={(e) =>
              update("duration", Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            disabled={disabled}
          />
          <p
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 11,
              color: "var(--taupe)",
              fontStyle: "italic",
              marginTop: 3,
            }}
          >
            Popup auto-closes after this many seconds during playback.
          </p>
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
        <PinPicker
          value={value.pinIcon}
          onChange={(v) => update("pinIcon", v)}
          disabled={disabled}
        />
      </div>

      <button
        onClick={onConfirm}
        disabled={disabled}
        className="btn-stamp py-2.5 mt-auto"
        style={{
          background: "var(--mahogany)",
          border: "2px solid var(--ink)",
          color: "var(--parchment)",
          boxShadow: "3px 3px 0px var(--ink)",
          fontFamily: "Cinzel, serif",
          fontSize: 10,
          letterSpacing: "0.18em",
        }}
      >
        Set Start Pin
      </button>
    </div>
  );
}
