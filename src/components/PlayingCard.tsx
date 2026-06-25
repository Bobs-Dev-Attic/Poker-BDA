import type { Card } from '../poker/cards'
import { RANK_LABEL, SUIT_SYMBOL } from '../poker/cards'
import { useSettings } from '../state/settings'

interface Props {
  card?: Card
  faceDown?: boolean
  size?: 'sm' | 'md' | 'lg'
  folded?: boolean
  selected?: boolean
  onClick?: () => void
}

function suitColor(suit: Card['suit'], fourColor: boolean): string {
  if (!fourColor) {
    return suit === 'h' || suit === 'd' ? 'var(--card-red)' : 'var(--card-black)'
  }
  switch (suit) {
    case 'h': return 'var(--card-red)'
    case 'd': return 'var(--card-blue)'
    case 'c': return 'var(--card-green)'
    case 's': return 'var(--card-black)'
  }
}

export function PlayingCard({ card, faceDown, size = 'md', folded, selected, onClick }: Props) {
  const { settings } = useSettings()
  const sizeClass = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''

  if (faceDown || !card) {
    return (
      <div
        className={`card-back ${sizeClass} ${settings.cardBack}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      />
    )
  }

  const color = suitColor(card.suit, settings.fourColorDeck)
  const label = RANK_LABEL[card.rank]
  const sym = SUIT_SYMBOL[card.suit]

  return (
    <div
      className={`playing-card ${sizeClass} ${folded ? 'folded' : ''}`}
      style={{
        color,
        outline: selected ? '3px solid var(--accent)' : undefined,
        transform: selected ? 'translateY(-10px)' : undefined,
        transition: 'transform 0.12s ease',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="corner" style={{ color }}>
        {label}
        {sym}
      </div>
      <div className="pip" style={{ color }}>{sym}</div>
      <div className="corner br" style={{ color }}>
        {label}
        {sym}
      </div>
    </div>
  )
}
