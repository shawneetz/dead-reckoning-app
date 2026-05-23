import { useEffect, useRef } from "react";
import { stepColor } from "../utils/colors";

export default function StepList({ steps, onDelete, disabled }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length]);

  if (!steps.length) {
    return (
      <div className="p-3 text-xs text-gray-400 italic">
        No steps yet — click the map to set a start point
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 text-xs border-b border-gray-100 hover:bg-gray-50"
          style={{ height: "32px", fontSize: "10px" }}
        >
          <span className="text-gray-400 w-4">{i + 1}</span>
          <div
            className="rounded-sm shrink-0"
            style={{
              width: 10,
              height: 10,
              backgroundColor: stepColor(i, steps.length),
            }}
          />
          <span className="font-mono w-10">{step.bearing}°</span>
          <span className="w-14">{step.distance}m</span>
          <span className="flex-1 truncate text-gray-500">
            {step.label || "—"}
          </span>
          <button
            onClick={() => onDelete(i)}
            disabled={disabled}
            className="text-red-400 hover:text-red-600 disabled:opacity-30 font-bold"
          >
            ✕
          </button>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
