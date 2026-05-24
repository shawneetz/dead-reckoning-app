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

      {value.description.trim() && (
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
            value={value.duration || ""}
            onChange={(e) =>
              update("duration", parseInt(e.target.value, 10) || 0)
            }
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
        <PinPicker
          value={value.pinIcon}
          onChange={(v) => update("pinIcon", v)}
          disabled={disabled}
        />
      </div>

      {/* Confirm button — saves the start pin and reveals StepForm */}
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
        ⚓ Set Start Pin
      </button>
    </div>
  );
}
