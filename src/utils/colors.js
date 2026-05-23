export function stepColor(index, total) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const r = Math.round(0x37 + (0x1d - 0x37) * t);
  const g = Math.round(0x8a + (0x9e - 0x8a) * t);
  const b = Math.round(0xdd + (0x75 - 0xdd) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
