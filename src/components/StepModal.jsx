import { useEffect, useState, useRef } from "react";

export default function StepModal({
  step,
  stepIndex,
  totalSteps,
  isPlayingStep,
  onClose,
  onResume,
  onPrevStep,
  onNextStep,
}) {
  const [open, setOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const hasContent = step?.description || step?.imageUrl;

  // Auto-open during playback if step has content
  useEffect(() => {
    if (isPlayingStep && hasContent) setOpen(true);
  }, [isPlayingStep, hasContent]);

  // Auto-close timer — uses step.duration if set, else 0 (no auto-close)
  useEffect(() => {
    if (!open || !isPlayingStep) return;
    const duration = step?.duration || 0;
    if (!duration) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleClose();
          onResume?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [open, step?.duration, isPlayingStep]);

  function handleClose() {
    clearInterval(timerRef.current);
    setOpen(false);
    setTimeLeft(null);
    onClose?.();
  }

  function handleResume() {
    clearInterval(timerRef.current);
    setOpen(false);
    setTimeLeft(null);
    onResume?.();
  }

  if (!open || !step) return null;

  const progress =
    timeLeft && step?.duration
      ? ((step.duration - timeLeft) / step.duration) * 100
      : null;

  return (
    /* Full-screen overlay — tap outside to dismiss */
    <div
      className="fixed inset-0 z-2000 flex items-end justify-center pb-10 px-4"
      style={{ background: "rgba(44,24,16,0.35)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Card — floats above the map at the bottom */}
      <div
        className="w-full max-w-lg relative overflow-hidden"
        style={{
          background: "var(--cream)",
          border: "2px solid var(--mahogany)",
          boxShadow: "0 8px 32px rgba(44,24,16,0.45), 6px 6px 0px var(--ink)",
        }}
      >
        {/* Timer progress bar — only shown when duration is set */}
        {progress !== null && (
          <div
            style={{
              height: 3,
              background: "var(--coolstone)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: "var(--mahogany)",
                transition: "width 1s linear",
              }}
            />
          </div>
        )}

        {/* Step image — full bleed if present */}
        {step.imageUrl && (
          <img
            src={step.imageUrl}
            alt={step.label || `Step ${stepIndex + 1}`}
            style={{
              width: "100%",
              maxHeight: 200,
              objectFit: "cover",
              display: "block",
              borderBottom: "1px solid var(--leather)",
            }}
          />
        )}

        <div className="p-5">
          {/* Top row — step indicator + close */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Step pill */}
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: 8,
                  letterSpacing: "0.25em",
                  color: "var(--parchment)",
                  background: "var(--mahogany)",
                  padding: "3px 10px",
                  border: "1px solid var(--ink)",
                }}
                className="uppercase"
              >
                Step {stepIndex + 1}
                {totalSteps ? ` of ${totalSteps}` : ""}
              </span>

              {/* Timer badge */}
              {timeLeft !== null && (
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    color: "var(--ochre)",
                    border: "1px solid var(--gold)",
                    padding: "2px 8px",
                  }}
                >
                  {timeLeft}s
                </span>
              )}
            </div>

            <button
              onClick={handleClose}
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: 12,
                color: "var(--taupe)",
                lineHeight: 1,
              }}
              className="hover:opacity-60 transition-opacity"
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: 16,
              color: "var(--ink)",
              letterSpacing: "0.06em",
              lineHeight: 1.3,
              marginBottom: step.description ? 8 : 16,
            }}
            className="font-bold uppercase"
          >
            {step.label || `${step.bearing}° · ${step.distance}m`}
          </h2>

          {/* Divider rule */}
          {step.description && (
            <div
              style={{
                borderTop: "3px double var(--leather)",
                marginBottom: 10,
              }}
            />
          )}

          {/* Description body */}
          {step.description && (
            <p
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 16,
                color: "var(--mahogany)",
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              {step.description}
            </p>
          )}

          {/* Nav stats row */}
          <div
            className="flex gap-6 mb-4"
            style={{ borderTop: "1px solid var(--coolstone)", paddingTop: 10 }}
          >
            {[
              ["Bearing", `${step.bearing}°`],
              ["Distance", `${step.distance}m`],
              ...(step.duration ? [["Auto-close", `${step.duration}s`]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: 7,
                    letterSpacing: "0.22em",
                    color: "var(--ochre)",
                  }}
                  className="uppercase mb-0.5"
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: "EB Garamond, serif",
                    fontSize: 18,
                    fontWeight: 500,
                    color: "var(--ink)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {onPrevStep && (
              <button
                onClick={() => {
                  handleClose();
                  onPrevStep?.();
                }}
                className="btn-stamp flex-1 py-2"
                style={{
                  background: "transparent",
                  border: "2px solid var(--gold)",
                  color: "var(--mahogany)",
                  boxShadow: "3px 3px 0px var(--gold)",
                }}
              >
                ← Prev
              </button>
            )}

            {isPlayingStep ? (
              <button
                onClick={handleResume}
                className="btn-stamp py-2.5"
                style={{
                  flex: 2,
                  background: "var(--mahogany)",
                  border: "2px solid var(--ink)",
                  color: "var(--parchment)",
                  boxShadow: "4px 4px 0px var(--ink)",
                }}
              >
                ▶ Resume Playback
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="btn-stamp py-2.5"
                style={{
                  flex: 2,
                  background: "var(--mahogany)",
                  border: "2px solid var(--ink)",
                  color: "var(--parchment)",
                  boxShadow: "4px 4px 0px var(--ink)",
                }}
              >
                Close
              </button>
            )}

            {onNextStep && (
              <button
                onClick={() => {
                  handleClose();
                  onNextStep?.();
                }}
                className="btn-stamp flex-1 py-2"
                style={{
                  background: "transparent",
                  border: "2px solid var(--gold)",
                  color: "var(--mahogany)",
                  boxShadow: "3px 3px 0px var(--gold)",
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
