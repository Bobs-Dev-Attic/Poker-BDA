// Persistent log of recent hands for review (Hand History) and the post-hand
// coach. Kept small so it stays on-device and fast.

import type { Card } from '../poker/cards'
import type { VariantId } from '../poker/types'

export interface HandRecord {
  id: number
  ts: number
  variant: VariantId
  hole: Card[]
  board: Card[]
  resultName?: string // your best hand at showdown, if reached
  net: number // chips won/lost this hand
  won: boolean
  showdown: boolean
  folded: boolean
  review: string[] // coach notes
}

const KEY = 'poker-bda.history.v1'
const MAX = 40

export function loadHistory(): HandRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function addHandRecord(rec: HandRecord): void {
  try {
    const list = loadHistory()
    list.unshift(rec)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
