export function fmt(n: number): string {
  return Math.round(n).toLocaleString()
}

// Opponent seat coordinates (percentages) arranged around the upper part of an
// ellipse so they "circle" the community cards in the middle of the table.
// The human sits at the bottom-center (handled separately).
export function ringPositions(m: number): { x: number; y: number }[] {
  const rx = 40
  const ry = 31
  const cx = 50
  const cy = 40
  return Array.from({ length: m }, (_, j) => {
    // Spread across the upper arc (180°→360°), centred.
    const frac = (j + 0.5) / m
    const theta = (180 + frac * 180) * (Math.PI / 180)
    return { x: cx + rx * Math.cos(theta), y: cy + ry * Math.sin(theta) }
  })
}
