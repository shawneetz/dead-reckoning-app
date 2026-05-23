import { useMemo } from "react";
import { calcStats } from "../utils/deadReckoning";

export default function StatsPanel({ steps, origin }) {
  const stats = useMemo(() => calcStats(steps, origin), [steps, origin]);

  if (!steps.length || !origin) {
    return (
      <div className="absolute bottom-4 left-4 z-1000 bg-white rounded-xl shadow-lg p-3 text-xs text-gray-400 italic">
        Add steps to see navigation stats
      </div>
    );
  }

  const drift = parseFloat(stats.driftPct);
  const driftColor =
    drift < 10
      ? "bg-green-100 text-green-700"
      : drift <= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="absolute bottom-4 left-4 z-1000 bg-white rounded-xl shadow-lg p-4 w-56 opacity-95">
      <div className={`rounded-lg px-3 py-2 mb-3 text-center ${driftColor}`}>
        <div className="text-3xl font-bold">{stats.driftPct}%</div>
        <div className="text-xs font-semibold uppercase tracking-wide">
          Drift from straight line
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Distance walked</span>
          <span className="font-semibold">
            {stats.totalWalked.toLocaleString()}m
          </span>
        </div>
        <div className="flex justify-between">
          <span>Displacement</span>
          <span className="font-semibold">
            {stats.displacement.toLocaleString()}m
          </span>
        </div>
        <div className="flex justify-between">
          <span>Direction from start</span>
          <span className="font-semibold">{stats.bearing}°</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400 leading-tight">
        Walked {stats.totalWalked.toLocaleString()}m but only moved{" "}
        {stats.displacement.toLocaleString()}m — {stats.driftPct}% drift
      </p>
    </div>
  );
}
