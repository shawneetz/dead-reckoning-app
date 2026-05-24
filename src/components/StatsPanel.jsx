import { useMemo } from "react";
import { calcStats } from "../utils/deadReckoning";

export default function StatsPanel({ steps, origin }) {
  const stats = useMemo(() => calcStats(steps, origin), [steps, origin]);

  if (!steps.length || !origin) return null;

  const drift = parseFloat(stats.driftPct);
  const driftColor =
    drift < 10 ? "var(--moss)" : drift <= 40 ? "var(--gold)" : "#7A1A1A";

  return (
    <div
      className="absolute z-1000"
      style={{
        bottom: 28,
        left: 16,
        width: 210,
        background: "var(--cream)",
        border: "2px solid var(--mahogany)",
        boxShadow: "4px 4px 0px var(--ink)",
        opacity: 0.96,
      }}
    >
      {/* Drift block */}
      <div
        className="px-4 py-3 text-center"
        style={{
          background: "var(--parchment)",
          borderBottom: "3px double var(--leather)",
        }}
      >
        <div
          style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 34,
            fontWeight: 500,
            color: driftColor,
            lineHeight: 1,
          }}
        >
          {stats.driftPct}%
        </div>
        <div
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 7,
            letterSpacing: "0.25em",
            color: "var(--taupe)",
            marginTop: 4,
          }}
          className="uppercase"
        >
          Drift
        </div>
      </div>

      {/* Stats rows */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {[
          ["Walked", `${stats.totalWalked.toLocaleString()}m`],
          ["Displacement", `${stats.displacement.toLocaleString()}m`],
          ["Direction", `${stats.bearing}°`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-baseline">
            <span
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 13,
                color: "var(--taupe)",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--ink)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div
        style={{ borderTop: "1px solid var(--coolstone)" }}
        className="px-4 py-2"
      >
        <p
          style={{
            fontFamily: "EB Garamond, serif",
            fontSize: 11,
            color: "var(--taupe)",
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          Walked {stats.totalWalked.toLocaleString()}m · moved{" "}
          {stats.displacement.toLocaleString()}m
        </p>
      </div>
    </div>
  );
}
