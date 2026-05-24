import { useEffect, useRef } from "react";
import { stepColor } from "../utils/colors";

export default function StepList({
  steps,
  onDelete,
  disabled,
  activeModalIndex,
  onStepClick,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length]);

  if (!steps.length) return null;

  return (
    <div
      className="absolute z-1000"
      style={{
        top: 16,
        right: 16,
        width: 260,
        maxHeight: "calc(100vh - 120px)",
        background: "var(--cream)",
        border: "2px solid var(--mahogany)",
        boxShadow: "4px 4px 0px var(--ink)",
        display: "flex",
        flexDirection: "column",
        opacity: 0.96,
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: "var(--mahogany)",
          borderBottom: "1px solid var(--ink)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 9,
            letterSpacing: "0.22em",
            color: "var(--parchment)",
          }}
          className="uppercase font-bold"
        >
          Steps — {steps.length}
        </span>
      </div>

      {/* Step rows — scrollable */}
      <div className="overflow-y-auto flex-1">
        {steps.map((step, i) => {
          const color = stepColor(i, steps.length);
          const isActive = activeModalIndex === i;
          const hasContent = step.description || step.imageUrl;

          return (
            <div
              key={i}
              onClick={() => onStepClick?.(i)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-opacity hover:opacity-80"
              style={{
                borderBottom: "1px solid var(--coolstone)",
                background: isActive ? "var(--mapfade)" : "transparent",
                borderLeft: isActive
                  ? `3px solid var(--mahogany)`
                  : "3px solid transparent",
              }}
            >
              {/* Step number */}
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 9,
                  color: "var(--taupe)",
                  width: 16,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>

              {/* Color swatch or emoji pin */}
              {step.pinIcon?.emoji ? (
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {step.pinIcon.emoji}
                </span>
              ) : step.pinIcon?.url ? (
                <img
                  src={step.pinIcon.url}
                  alt="pin"
                  style={{
                    width: 14,
                    height: 14,
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Bearing + distance */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--ink)",
                    }}
                  >
                    {step.bearing}°
                  </span>
                  <span
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 12,
                      color: "var(--taupe)",
                    }}
                  >
                    {step.distance}m
                  </span>
                </div>
                {step.label && (
                  <p
                    style={{
                      fontFamily: "EB Garamond, serif",
                      fontSize: 11,
                      color: "var(--ochre)",
                      fontStyle: "italic",
                      lineHeight: 1.2,
                    }}
                    className="truncate"
                  >
                    {step.label}
                  </p>
                )}
                {hasContent && (
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 7,
                      letterSpacing: "0.18em",
                      color: "var(--moss)",
                    }}
                    className="uppercase"
                  >
                    ✦ annotated
                  </span>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(i);
                }}
                disabled={disabled}
                style={{
                  color: "#7A1A1A",
                  fontSize: 12,
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
                className="hover:opacity-60 disabled:opacity-30 transition-opacity leading-none"
              >
                ✕
              </button>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
