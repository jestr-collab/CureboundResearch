export function fillForCount(count: number, max: number): string {
  if (count <= 0) return "var(--map-empty)";
  const t = count / max;
  if (t >= 0.75) return "var(--map-high)";
  if (t >= 0.4) return "var(--map-mid)";
  return "var(--map-low)";
}
