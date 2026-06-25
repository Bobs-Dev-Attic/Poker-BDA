export function fmt(n: number): string {
  return Math.round(n).toLocaleString()
}

// Seat coordinates (percentages). The human sits at the bottom-center; the
// opponents are arced across the top half so they never overlap the community
// cards in the middle of the table.
export function seatPositions(count: number, humanIndex: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = new Array(count)
  positions[humanIndex] = { x: 50, y: 83 }

  const opps: number[] = []
  for (let i = 0; i < count; i++) if (i !== humanIndex) opps.push(i)

  const rx = 41
  const ry = 33
  const cy = 44
  const m = opps.length
  opps.forEach((idx, j) => {
    // Spread evenly across the upper semicircle (180°→360°).
    const frac = (j + 1) / (m + 1)
    const theta = (180 + frac * 180) * (Math.PI / 180)
    positions[idx] = {
      x: 50 + rx * Math.cos(theta),
      y: cy + ry * Math.sin(theta),
    }
  })
  return positions
}
