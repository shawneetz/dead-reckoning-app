import { useState } from "react";

export default function SaveRouteModal({
  onSave,
  onClose,
  saving,
  saveError,
  savedRoute,
}) {
  const [title, setTitle] = useState(savedRoute?.title || "Untitled Route");
  const [description, setDesc] = useState(savedRoute?.description || "");
  const [isPublic, setIsPublic] = useState(savedRoute?.is_public || false);

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center justify-center px-4"
      style={{ background: "rgba(44,24,16,0.6)" }}
    >
      <div
        className="w-full max-w-sm p-6"
        style={{
          background: "var(--cream)",
          border: "2px solid var(--mahogany)",
          boxShadow: "6px 6px 0px var(--ink)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6"
          style={{
            borderBottom: "3px double var(--leather)",
            paddingBottom: "0.75rem",
          }}
        >
          <h2
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 13,
              letterSpacing: "0.15em",
              color: "var(--ink)",
            }}
            className="uppercase font-bold"
          >
            {savedRoute?.id ? "Update Route" : "Save Route"}
          </h2>
          <button
            onClick={onClose}
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 10,
              color: "var(--taupe)",
            }}
            className="hover:opacity-60 transition-opacity"
          >
            ✕
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <label
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.2em",
                color: "var(--ochre)",
              }}
              className="uppercase block mb-1"
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name your route"
            />
          </div>
          <div>
            <label
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 8,
                letterSpacing: "0.2em",
                color: "var(--ochre)",
              }}
              className="uppercase block mb-1"
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe this route (optional)"
              rows={3}
              style={{ resize: "none" }}
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: "var(--ochre)",
                }}
                className="uppercase"
              >
                Visibility
              </p>
              <p
                style={{
                  fontFamily: "EB Garamond, serif",
                  fontSize: 12,
                  color: "var(--taupe)",
                  fontStyle: "italic",
                }}
              >
                {isPublic
                  ? "Public — visible in gallery"
                  : "Private — only you can see it"}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className="btn-stamp px-3 py-1.5"
              style={
                isPublic
                  ? {
                      background: "var(--moss)",
                      border: "2px solid var(--forest)",
                      color: "var(--cream)",
                      boxShadow: "3px 3px 0px var(--forest)",
                    }
                  : {
                      background: "var(--mapfade)",
                      border: "2px solid var(--mahogany)",
                      color: "var(--ochre)",
                      boxShadow: "3px 3px 0px var(--mahogany)",
                    }
              }
            >
              {isPublic ? "Public" : "Private"}
            </button>
          </div>
        </div>

        {/* Error */}
        {saveError && (
          <p
            className="mb-3"
            style={{
              color: "#7A1A1A",
              fontFamily: "EB Garamond, serif",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            {saveError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-stamp flex-1 py-2"
            style={{
              background: "transparent",
              border: "2px solid var(--gold)",
              color: "var(--mahogany)",
              boxShadow: "3px 3px 0px var(--gold)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(title, description, isPublic)}
            disabled={saving || !title.trim()}
            className="btn-stamp flex-1 py-2"
            style={{
              background: "var(--mahogany)",
              border: "2px solid var(--ink)",
              color: "var(--parchment)",
              boxShadow: "4px 4px 0px var(--ink)",
            }}
          >
            {saving ? "Saving…" : savedRoute?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
