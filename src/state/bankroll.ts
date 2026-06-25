// Bankroll series: cumulative net chips after each completed hand, for the
// Stats bankroll graph. Capped so it stays small on-device.

const KEY = 'poker-bda.bankroll.v1'
const MAX = 300

export function loadBankroll(): number[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

// Append a per-hand chip delta; stores the running cumulative total.
export function pushBankrollDelta(delta: number): void {
  try {
    const series = loadBankroll()
    const last = series.length ? series[series.length - 1] : 0
    series.push(last + delta)
    localStorage.setItem(KEY, JSON.stringify(series.slice(-MAX)))
  } catch {
    // ignore
  }
}

export function clearBankroll(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
