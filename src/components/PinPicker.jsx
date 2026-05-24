import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiUpload } from "../lib/api";

const DEFAULT_PINS = [
  { id: "default", label: "Dot", emoji: null, color: null },
  { id: "anchor", label: "Anchor", emoji: "⚓" },
  { id: "flag", label: "Flag", emoji: "🚩" },
  { id: "ship", label: "Ship", emoji: "🚢" },
  { id: "star", label: "Star", emoji: "⭐" },
];

export default function PinPicker({ value, onChange, disabled }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [customPins, setCustomPins] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const pickerRef = useRef(null);

  // Load user's custom pins when logged in
  useEffect(() => {
    if (!user) return;
    apiFetch("/api/upload/pin-icons/mine")
      .then(setCustomPins)
      .catch(() => {});
  }, [user]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name.replace(/\.[^.]+$/, ""));
      const pin = await apiUpload("/api/upload/pin-icon", fd);
      setCustomPins((prev) => [pin, ...prev]);
      onChange({
        type: "custom",
        id: pin.id,
        url: pin.url,
        fileType: pin.file_type,
      });
      setOpen(false);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function selectDefault(pin) {
    onChange({ type: "default", id: pin.id, emoji: pin.emoji });
    setOpen(false);
  }

  function selectCustom(pin) {
    onChange({
      type: "custom",
      id: pin.id,
      url: pin.file_url,
      fileType: pin.file_type,
    });
    setOpen(false);
  }

  function clearPin() {
    onChange(null);
    setOpen(false);
  }

  // Preview of currently selected pin
  function renderPreview() {
    if (!value) return <span style={{ fontSize: 14 }}>📍</span>;
    if (value.type === "default" && value.emoji)
      return <span style={{ fontSize: 14 }}>{value.emoji}</span>;
    if (value.type === "custom" && value.url)
      return (
        <img
          src={value.url}
          alt="pin"
          style={{ width: 18, height: 18, objectFit: "contain" }}
        />
      );
    return <span style={{ fontSize: 14 }}>📍</span>;
  }

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-1">
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "var(--ochre)",
          }}
          className="uppercase"
        >
          Pin Icon
        </p>
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className="flex items-center gap-2 px-2 py-1 disabled:opacity-40"
          style={{
            background: "var(--mapfade)",
            border: "1.5px solid var(--taupe)",
            minWidth: 80,
          }}
        >
          {renderPreview()}
          <span
            style={{
              fontFamily: "EB Garamond, serif",
              fontSize: 12,
              color: "var(--ochre)",
            }}
          >
            {value
              ? value.type === "default"
                ? DEFAULT_PINS.find((p) => p.id === value.id)?.label || "Custom"
                : "Custom"
              : "Default"}
          </span>
          <span
            style={{ color: "var(--taupe)", fontSize: 10, marginLeft: "auto" }}
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <div
          className="absolute top-full left-0 z-3000 mt-1 w-64 p-3"
          style={{
            background: "var(--cream)",
            border: "2px solid var(--mahogany)",
            boxShadow: "4px 4px 0px var(--ink)",
          }}
        >
          {/* Clear option */}
          <button
            onClick={clearPin}
            className="w-full text-left px-2 py-1 mb-2 hover:opacity-70 transition-opacity"
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "var(--taupe)",
              borderBottom: "1px solid var(--coolstone)",
              paddingBottom: 6,
            }}
          >
            ✕ CLEAR (use default dot)
          </button>

          {/* Default pins */}
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 8,
              letterSpacing: "0.2em",
              color: "var(--ochre)",
            }}
            className="uppercase mb-2"
          >
            Built-in
          </p>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {DEFAULT_PINS.filter((p) => p.id !== "default").map((pin) => (
              <button
                key={pin.id}
                onClick={() => selectDefault(pin)}
                className="flex flex-col items-center gap-0.5 p-1.5 hover:opacity-70 transition-opacity"
                style={{
                  background:
                    value?.id === pin.id ? "var(--mapfade)" : "transparent",
                  border:
                    value?.id === pin.id
                      ? "1.5px solid var(--mahogany)"
                      : "1.5px solid transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{pin.emoji}</span>
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 7,
                    color: "var(--taupe)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {pin.label.toUpperCase()}
                </span>
              </button>
            ))}
          </div>

          {/* Custom pins — only for logged-in users */}
          {user ? (
            <>
              {customPins.length > 0 && (
                <>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 8,
                      letterSpacing: "0.2em",
                      color: "var(--ochre)",
                    }}
                    className="uppercase mb-2"
                  >
                    Your Uploads
                  </p>
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {customPins.map((pin) => (
                      <button
                        key={pin.id}
                        onClick={() => selectCustom(pin)}
                        className="flex flex-col items-center gap-0.5 p-1.5 hover:opacity-70 transition-opacity"
                        style={{
                          background:
                            value?.id === pin.id
                              ? "var(--mapfade)"
                              : "transparent",
                          border:
                            value?.id === pin.id
                              ? "1.5px solid var(--mahogany)"
                              : "1.5px solid transparent",
                        }}
                      >
                        <img
                          src={pin.file_url}
                          alt={pin.name}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Cinzel, serif",
                            fontSize: 7,
                            color: "var(--taupe)",
                            letterSpacing: "0.1em",
                          }}
                          className="truncate w-full text-center"
                        >
                          {pin.name?.toUpperCase()?.slice(0, 5) || "PIN"}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Upload button */}
              <label
                className="flex items-center justify-center gap-2 py-2 cursor-pointer hover:opacity-70 transition-opacity"
                style={{
                  border: "1.5px dashed var(--gold)",
                  color: "var(--ochre)",
                  fontFamily: "Cinzel, serif",
                  fontSize: 8,
                  letterSpacing: "0.18em",
                  opacity: uploading ? 0.5 : 1,
                  pointerEvents: uploading ? "none" : "auto",
                }}
              >
                <input
                  type="file"
                  accept=".svg,image/svg+xml,image/png"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? "UPLOADING…" : "+ UPLOAD SVG OR PNG"}
              </label>
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 10,
                  color: "var(--taupe)",
                  fontStyle: "italic",
                  marginTop: 4,
                }}
              >
                Max 512KB · normalised to 64×64px
              </p>
              {uploadError && (
                <p
                  style={{
                    color: "#7A1A1A",
                    fontFamily: "EB Garamond, serif",
                    fontSize: 11,
                    fontStyle: "italic",
                    marginTop: 4,
                  }}
                >
                  {uploadError}
                </p>
              )}
            </>
          ) : (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 12,
                color: "var(--taupe)",
                fontStyle: "italic",
              }}
            >
              Sign in to upload custom pin icons.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
