// Educational content for the Learn Center.

import type { VariantId } from '../poker/types'

export interface HandRankInfo {
  name: string
  example: string // card ids like "14s 13s 12s 11s 10s"
  blurb: string
}

// Best to worst.
export const HAND_RANKINGS: HandRankInfo[] = [
  { name: 'Royal Flush', example: '14s 13s 12s 11s 10s', blurb: 'A, K, Q, J, 10 all of the same suit. The best possible hand.' },
  { name: 'Straight Flush', example: '9h 8h 7h 6h 5h', blurb: 'Five cards in sequence, all the same suit.' },
  { name: 'Four of a Kind', example: '7c 7d 7h 7s 12c', blurb: 'Four cards of the same rank.' },
  { name: 'Full House', example: '13c 13d 13h 4s 4c', blurb: 'Three of a kind plus a pair.' },
  { name: 'Flush', example: '14d 11d 8d 5d 2d', blurb: 'Five cards of the same suit, not in sequence.' },
  { name: 'Straight', example: '10c 9d 8h 7s 6c', blurb: 'Five cards in sequence, mixed suits.' },
  { name: 'Three of a Kind', example: '11c 11d 11h 6s 2c', blurb: 'Three cards of the same rank.' },
  { name: 'Two Pair', example: '12c 12d 5h 5s 9c', blurb: 'Two different pairs.' },
  { name: 'One Pair', example: '14c 14d 9h 6s 3c', blurb: 'Two cards of the same rank.' },
  { name: 'High Card', example: '14c 11d 8h 6s 3c', blurb: 'No combination — highest card plays.' },
]

export interface GameGuide {
  id: VariantId
  name: string
  blurb: string
  howToPlay: string[]
  tips: string[]
}

export const GAME_GUIDES: Record<VariantId, GameGuide> = {
  holdem: {
    id: 'holdem',
    name: "Texas Hold'em",
    blurb: 'The world’s most popular poker game. Two private cards, five shared.',
    howToPlay: [
      'Each player is dealt two private "hole" cards.',
      'Two players post the small and big blinds to start the betting.',
      'Pre-flop: a round of betting using only your hole cards.',
      'The flop: three community cards are dealt face-up, then betting.',
      'The turn: a fourth community card, then betting.',
      'The river: a fifth community card, then a final round of betting.',
      'Showdown: make your best five-card hand from any of your two hole cards and the five community cards.',
    ],
    tips: [
      'Position matters: acting later lets you see what others do first.',
      'Play tighter from early position, looser from the button.',
      'Premium starting hands: big pairs (AA–TT), AK, AQ.',
      'A "draw" (e.g. four to a flush) is not made yet — weigh the odds before calling.',
      'Don’t pay to chase weak draws when the price is high.',
    ],
  },
  'five-card-draw': {
    id: 'five-card-draw',
    name: 'Five-Card Draw',
    blurb: 'A classic home game. Five cards each, one chance to swap.',
    howToPlay: [
      'Each player is dealt five private cards.',
      'A round of betting takes place (the pre-draw round).',
      'Each remaining player may discard cards and draw replacements.',
      'A second round of betting takes place (the post-draw round).',
      'Showdown: best five-card hand wins.',
    ],
    tips: [
      'Drawing three cards tells observant opponents you likely hold one pair.',
      'Standing pat (drawing none) represents a strong made hand — sometimes a bluff.',
      'With two pair, draw one card; with three of a kind, draw two.',
      'Keep a high kicker with a pair when you want to disguise your draw.',
      'A four-card flush or open-ended straight draw is worth one card most of the time.',
    ],
  },
}

export interface GlossaryTerm {
  term: string
  def: string
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'Blinds', def: 'Forced bets posted before cards are dealt to seed the pot.' },
  { term: 'Pot odds', def: 'The ratio of the current pot to the cost of a call — used to judge whether a call is profitable.' },
  { term: 'Equity', def: 'Your share of the pot based on the probability your hand wins.' },
  { term: 'Position', def: 'Where you sit relative to the dealer button; later position is an advantage.' },
  { term: 'Outs', def: 'The unseen cards that would improve your hand to a likely winner.' },
  { term: 'Check', def: 'Decline to bet while keeping your hand, when there is nothing to call.' },
  { term: 'Bluff', def: 'Betting or raising a weak hand to make stronger hands fold.' },
  { term: 'All-in', def: 'Betting all of your remaining chips.' },
  { term: 'Side pot', def: 'A separate pot created when a player is all-in and others keep betting.' },
  { term: 'Muck', def: 'To discard a hand without showing it.' },
]
