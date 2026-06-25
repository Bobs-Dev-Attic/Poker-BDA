// Card primitives, deck creation and shuffling.

export type Suit = 'c' | 'd' | 'h' | 's'
// Rank values: 2..14 where 11=J, 12=Q, 13=K, 14=A
export type Rank =
  | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14

export interface Card {
  rank: Rank
  suit: Suit
}

export const SUITS: Suit[] = ['c', 'd', 'h', 's']
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

export const SUIT_SYMBOL: Record<Suit, string> = {
  c: '♣', // ♣
  d: '♦', // ♦
  h: '♥', // ♥
  s: '♠', // ♠
}

export const SUIT_NAME: Record<Suit, string> = {
  c: 'Clubs',
  d: 'Diamonds',
  h: 'Hearts',
  s: 'Spades',
}

export const RANK_LABEL: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
}

export const RANK_WORD: Record<Rank, string> = {
  2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight',
  9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace',
}

export function cardId(c: Card): string {
  return `${c.rank}${c.suit}`
}

export function cardLabel(c: Card): string {
  return `${RANK_LABEL[c.rank]}${SUIT_SYMBOL[c.suit]}`
}

export function isRed(c: Card): boolean {
  return c.suit === 'd' || c.suit === 'h'
}

export function makeDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  return deck
}

// Fisher–Yates shuffle using an injectable RNG (defaults to Math.random)
// so games are testable and reproducible with a seeded generator.
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Mulberry32 — a tiny seedable PRNG, handy for reproducible tutorial deals.
export function seededRng(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
