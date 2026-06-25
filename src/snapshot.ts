// Capture a DOM node to a PNG and share or download it. This works even when
// the OS blocks normal screenshots (e.g. Incognito), because we render the DOM
// ourselves rather than relying on the system screenshot path.

import { toPng } from 'html-to-image'

export async function shareSnapshot(node: HTMLElement, bg: string): Promise<'shared' | 'downloaded' | 'failed'> {
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      backgroundColor: bg,
      cacheBust: true,
      // Skip elements explicitly marked to be excluded from snapshots.
      filter: (el) => !(el instanceof HTMLElement && el.dataset.noSnapshot === 'true'),
    })
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], `poker-bda-${Date.now()}.png`, { type: 'image/png' })

    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: 'Poker BDA' })
      return 'shared'
    }

    // Fallback: trigger a download.
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    return 'downloaded'
  } catch (err) {
    // User cancelling the share sheet also lands here; treat as non-fatal.
    if (err instanceof DOMException && err.name === 'AbortError') return 'shared'
    console.error('snapshot failed', err)
    return 'failed'
  }
}
