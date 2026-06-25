// Tiny Web Audio sound effects — no asset files needed. Each effect is a
// short synthesized blip so the PWA stays lightweight and works offline.

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function blip(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.06) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + durationMs / 1000)
}

export type SfxName = 'deal' | 'check' | 'bet' | 'fold' | 'win' | 'chip' | 'click'

let enabled = false
export function setSoundEnabled(on: boolean) {
  enabled = on
}

export function sfx(name: SfxName) {
  if (!enabled) return
  switch (name) {
    case 'deal': blip(520, 60, 'triangle'); break
    case 'check': blip(300, 80, 'sine'); break
    case 'bet': blip(440, 90, 'square', 0.05); break
    case 'fold': blip(200, 120, 'sawtooth', 0.04); break
    case 'chip': blip(660, 50, 'triangle', 0.05); break
    case 'click': blip(380, 40, 'sine', 0.04); break
    case 'win':
      blip(523, 120, 'triangle')
      setTimeout(() => blip(659, 120, 'triangle'), 110)
      setTimeout(() => blip(784, 200, 'triangle'), 220)
      break
  }
}
