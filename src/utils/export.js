import { buildCoords } from "./deadReckoning";

export function exportGeoJSON(steps, origin) {
  if (!steps.length || !origin) return;
  const coords = buildCoords(steps, origin);
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coords.map(([lat, lng]) => [lng, lat]),
        },
        properties: { steps: steps.length },
      },
    ],
  };
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dead-reckoning-route.geojson";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function captureScreenshot() {
  // html2canvas cannot capture cross-origin OSM tiles reliably.
  // Best method: use the browser's built-in screenshot (Win+Shift+S / Cmd+Shift+4).
  // This button opens a guide dialog instead.
  const msg = [
    "To screenshot the map:",
    "",
    "Windows: Win + Shift + S",
    "Mac:     Cmd + Shift + 4",
    "Mobile:  Power + Volume Down",
    "",
  ].join("\n");
  alert(msg);
}
