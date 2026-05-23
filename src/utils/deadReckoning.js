import * as turf from "@turf/turf";

export function parseBearing(input) {
  const map = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
  };
  const s = String(input).trim().toUpperCase();
  return map[s] !== undefined ? map[s] : parseFloat(s);
}

export function bearingToLatLng([lat, lng], bearingDeg, distMeters) {
  const origin = turf.point([lng, lat]);
  const dest = turf.destination(origin, distMeters / 1000, bearingDeg);
  const [dLng, dLat] = dest.geometry.coordinates;
  return [dLat, dLng];
}

export function buildCoords(steps, origin) {
  if (!origin || !steps.length) return origin ? [origin] : [];
  const coords = [origin];
  steps.forEach((step) => {
    const prev = coords[coords.length - 1];
    coords.push(bearingToLatLng(prev, step.bearing, step.distance));
  });
  return coords;
}

export function calcStats(steps, origin) {
  if (!steps.length || !origin)
    return { totalWalked: 0, displacement: 0, driftPct: 0, bearing: 0 };
  const totalWalked = steps.reduce((sum, s) => sum + s.distance, 0);
  const coords = buildCoords(steps, origin);
  const final = coords[coords.length - 1];
  const from = turf.point([origin[1], origin[0]]);
  const to = turf.point([final[1], final[0]]);
  const displacement = turf.distance(from, to) * 1000;
  const bearing = turf.bearing(from, to);
  const driftPct =
    totalWalked > 0
      ? (((totalWalked - displacement) / totalWalked) * 100).toFixed(1)
      : 0;
  return {
    totalWalked,
    displacement: Math.round(displacement),
    driftPct,
    bearing: Math.round(bearing),
  };
}
