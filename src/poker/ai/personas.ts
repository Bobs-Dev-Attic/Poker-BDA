// AI opponent definitions: skill levels and personas.
//
// A persona shapes *style* (how loose/aggressive/bluffy), while skill shapes
// *competence* (how well the bot reads strength, sizes bets, and avoids
// mistakes). The decision engine in ai.ts blends both.

export type SkillLevel = 'novice' | 'casual' | 'skilled' | 'expert' | 'shark'

export interface SkillProfile {
  id: SkillLevel
  name: string
  // 0..1 — how closely play tracks true hand strength (less random noise).
  accuracy: number
  // 0..1 — ability to value-bet thin and fold correctly.
  discipline: number
  description: string
}

export const SKILLS: Record<SkillLevel, SkillProfile> = {
  novice: {
    id: 'novice',
    name: 'Novice',
    accuracy: 0.45,
    discipline: 0.3,
    description: 'Just learning. Plays too many hands and rarely bluffs on purpose.',
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    accuracy: 0.62,
    discipline: 0.5,
    description: 'Knows the basics. Decent hand selection, predictable betting.',
  },
  skilled: {
    id: 'skilled',
    name: 'Skilled',
    accuracy: 0.78,
    discipline: 0.7,
    description: 'Solid player. Reads the board, sizes bets, and bluffs with purpose.',
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    accuracy: 0.9,
    discipline: 0.85,
    description: 'Tough opponent. Pot odds, position, and balanced ranges.',
  },
  shark: {
    id: 'shark',
    name: 'Shark',
    accuracy: 0.97,
    discipline: 0.95,
    description: 'Ruthless and precise. Punishes every mistake.',
  },
}

export type PersonaId =
  | 'rock'
  | 'maniac'
  | 'station'
  | 'bluffer'
  | 'pro'
  | 'wildcard'

export interface Persona {
  id: PersonaId
  name: string
  emoji: string
  // 0..1 — proportion of hands willing to play (higher = looser).
  looseness: number
  // 0..1 — preference for betting/raising over calling.
  aggression: number
  // 0..1 — frequency of bluffing with weak hands.
  bluff: number
  tagline: string
  description: string
  // Flavor lines keyed by situation, shown as table chatter.
  chatter: {
    raise: string[]
    bigWin: string[]
    bluffCaught: string[]
    fold: string[]
    badBeat: string[]
  }
}

export const PERSONAS: Record<PersonaId, Persona> = {
  rock: {
    id: 'rock',
    name: 'Rocky',
    emoji: '🗿',
    looseness: 0.18,
    aggression: 0.35,
    bluff: 0.05,
    tagline: 'The Rock',
    description: 'Tight and patient. If Rocky bets, believe it.',
    chatter: {
      raise: ['I only play the nuts.', 'This one is real.'],
      bigWin: ['Patience pays.', 'Told you.'],
      bluffCaught: ['...that never happens.'],
      fold: ['Not worth it.', 'Folding. Again.'],
      badBeat: ['Unbelievable. I had it.'],
    },
  },
  maniac: {
    id: 'maniac',
    name: 'Max',
    emoji: '🔥',
    looseness: 0.8,
    aggression: 0.9,
    bluff: 0.45,
    tagline: 'The Maniac',
    description: 'Raises everything. Chaos incarnate — and occasionally right.',
    chatter: {
      raise: ['RAISE! Again!', 'Turn up the heat 🔥', 'All gas, no brakes.'],
      bigWin: ['EASY GAME!', "Can't stop, won't stop."],
      bluffCaught: ['Worth it. Always worth it.'],
      fold: ['Fine, take it. For now.'],
      badBeat: ['Rigged!'],
    },
  },
  station: {
    id: 'station',
    name: 'Stan',
    emoji: '📞',
    looseness: 0.7,
    aggression: 0.2,
    bluff: 0.08,
    tagline: 'The Calling Station',
    description: 'Calls. And calls. Never met a bet he didn’t want to see.',
    chatter: {
      raise: ['I guess I’ll bet?'],
      bigWin: ['I had a feeling.', 'See, calling works!'],
      bluffCaught: ['I just wanted to see it.'],
      fold: ['Hmm... okay, fold.'],
      badBeat: ['So close!'],
    },
  },
  bluffer: {
    id: 'bluffer',
    name: 'Bianca',
    emoji: '🎭',
    looseness: 0.55,
    aggression: 0.75,
    bluff: 0.6,
    tagline: 'The Bluffer',
    description: 'Tells a great story. Half the time there’s nothing behind it.',
    chatter: {
      raise: ['Are you sure about that?', 'I represent strength 😏'],
      bigWin: ['Did you really believe me?', 'The art of the bluff.'],
      bluffCaught: ['Okay, you got me that time.'],
      fold: ['I’ll let you have this one.'],
      badBeat: ['I had you read perfectly!'],
    },
  },
  pro: {
    id: 'pro',
    name: 'Priya',
    emoji: '🧠',
    looseness: 0.42,
    aggression: 0.6,
    bluff: 0.3,
    tagline: 'The Pro',
    description: 'Balanced, disciplined, hard to read. Textbook poker.',
    chatter: {
      raise: ['Position and pressure.', 'The math favors this.'],
      bigWin: ['As expected.', 'Discipline wins.'],
      bluffCaught: ['Good read. Noted.'],
      fold: ['Not the right spot.'],
      badBeat: ['Variance. It happens.'],
    },
  },
  wildcard: {
    id: 'wildcard',
    name: 'Winnie',
    emoji: '🃏',
    looseness: 0.6,
    aggression: 0.55,
    bluff: 0.4,
    tagline: 'The Wildcard',
    description: 'Unpredictable by design. Good luck putting her on a hand.',
    chatter: {
      raise: ['Why not?', 'Feeling lucky 🍀', 'Let’s mix it up.'],
      bigWin: ['Chaos theory!', 'Didn’t see that coming, did you?'],
      bluffCaught: ['Ha! Fair enough.'],
      fold: ['Nah, not this time.'],
      badBeat: ['Wild game, wild result.'],
    },
  },
}

export function pickChatter(lines: string[], salt: number): string {
  if (lines.length === 0) return ''
  return lines[Math.abs(salt) % lines.length]
}
