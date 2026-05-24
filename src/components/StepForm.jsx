import { useState } from "react";
import { parseBearing } from "../utils/deadReckoning";
import PinPicker from "./PinPicker";
import { apiUpload } from "../lib/api";

export default function StepForm({ onAddStep, disabled }) {
  const [bearing, setBearing] = useState("");
  const [distance, setDistance] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(5);
  const [imageUrl, setImageUrl] = useState("");
  const [pinIcon, setPinIcon] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function handleAdd() {
    const b = parseBearing(bearing);
    const d = parseFloat(distance);
    if (isNaN(b) || b < 0 || b > 360) {
      setError("Direction must be 0–360 or a cardinal (N, NE, E, …)");
      return;
    }
    if (isNaN(d) || d <= 0 || d >= 50000) {
      setError("Distance must be between 1 and 50,000 metres");
      return;
    }
    setError(null);
    onAddStep({
      bearing: b,
      distance: d,
      label: label.trim() || "",
      description: description.trim() || "",
      duration: Math.max(1, duration),
      imageUrl: imageUrl || "",
      pinIcon: pinIcon || null,
      pinColor: pinIcon?.color || "#378ADD",
    });
    setBearing("");
    setDistance("");
    setLabel("");
    setDescription("");
    setDuration(5);
    setImageUrl("");
    setPinIcon(null);
  }

  const labelStyle = {
    fontFamily: "Cinzel, serif",
    fontSize: 8,
    letterSpacing: "0.18em",
    color: "var(--ochre)",
  };

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      style={{ borderBottom: "1px solid var(--coolstone)" }}
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

      {/* Bearing + Distance */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label style={labelStyle} className="uppercase block mb-1">
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
          <label style={labelStyle} className="uppercase block mb-1">
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

      {/* Label */}
      <div>
        <label style={labelStyle} className="uppercase block mb-1">
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

      {/* Description */}
      <div>
        <label style={labelStyle} className="uppercase block mb-1">
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
          <label style={labelStyle} className="uppercase block mb-1">
            Popup duration (seconds, min 1)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={duration}
            onChange={(e) =>
              setDuration(Math.max(1, parseInt(e.target.value, 10) || 1))
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

      {/* Image upload */}
      <div>
        <label style={labelStyle} className="uppercase block mb-1">
          Step image (optional)
        </label>
        {imageUrl ? (
          <div className="flex items-center gap-2">
            <img
              src={imageUrl}
              alt="preview"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                border: "1px solid var(--leather)",
              }}
            />
            <button
              onClick={() => setImageUrl("")}
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.15em",
                color: "#7A1A1A",
              }}
              className="uppercase hover:opacity-70"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px dashed var(--taupe)",
              padding: "8px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontFamily: "EB Garamond, serif",
              fontSize: 13,
              color: "var(--taupe)",
              fontStyle: "italic",
              opacity: uploading ? 0.5 : 1,
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled || uploading}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  const { url } = await apiUpload("/api/upload/image", fd);
                  setImageUrl(url);
                } catch (err) {
                  setError("Image upload failed: " + err.message);
                } finally {
                  setUploading(false);
                }
              }}
            />
            {uploading ? "Uploading…" : "+ Upload image"}
          </label>
        )}
      </div>

      {/* Pin style */}
      <div>
        <label style={labelStyle} className="uppercase block mb-1">
          Pin Icon
        </label>
        <PinPicker value={pinIcon} onChange={setPinIcon} disabled={disabled} />
      </div>

      {error && (
        <p
          style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 12,
            color: "#7A1A1A",
            fontStyle: "italic",
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="btn-stamp py-2 disabled:opacity-40"
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
        Add Step
      </button>
    </div>
  );
}
