import { useEffect, useRef } from 'react'
import {
  prepareWithSegments,
  layoutNextLine,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from '@chenglou/pretext'

import superstateIcon from '../assets/images/_Superstate-IconHero_Original.svg'
import commonStateIcon from '../assets/images/CommonState_Cutdown_Black.svg'

// ── Types ──
type Interval = { left: number; right: number }
type PositionedLine = { x: number; y: number; width: number; slotWidth: number; text: string; font: string; lineHeight: number; color: string; justify: boolean; isLastLine: boolean }
type CircleObstacle = { cx: number; cy: number; r: number; hPad: number; vPad: number }

type Orb = {
  x: number; y: number; r: number
  vx: number; vy: number
  paused: boolean
  color: [number, number, number]
}

type DragState = {
  orbIndex: number
  startPointerX: number; startPointerY: number
  startOrbX: number; startOrbY: number
} | null

// ── Constants ──
const MIN_SLOT_WIDTH = 12

// Insert zero-width spaces between every character so pretext can break anywhere
function charBreakable(text: string): string {
  return text.split('').join('\u200B')
}

const ORB_DEFS = [
  { fx: 0.35, fy: 0.45, r: 80, vx: 28, vy: 20, color: [196, 163, 90] as [number, number, number], icon: superstateIcon },
  { fx: 0.65, fy: 0.7, r: 50, vx: -22, vy: 18, color: [80, 130, 220] as [number, number, number], icon: commonStateIcon },
]

// ── Core geometry (from editorial-engine.ts) ──
function carveTextLineSlots(base: Interval, blocked: Interval[]): Interval[] {
  let slots = [base]
  for (const interval of blocked) {
    const next: Interval[] = []
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) { next.push(slot); continue }
      if (interval.left > slot.left) next.push({ left: slot.left, right: interval.left })
      if (interval.right < slot.right) next.push({ left: interval.right, right: slot.right })
    }
    slots = next
  }
  return slots.filter(s => s.right - s.left >= MIN_SLOT_WIDTH)
}

function circleIntervalForBand(
  cx: number, cy: number, r: number,
  bandTop: number, bandBottom: number, hPad: number, vPad: number,
): Interval | null {
  const top = bandTop - vPad
  const bottom = bandBottom + vPad
  if (top >= cy + r || bottom <= cy - r) return null
  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom
  if (minDy >= r) return null
  const maxDx = Math.sqrt(r * r - minDy * minDy)
  return { left: cx - maxDx - hPad, right: cx + maxDx + hPad }
}

function layoutColumn(
  prepared: PreparedTextWithSegments, startCursor: LayoutCursor,
  regionX: number, regionY: number, regionW: number, regionH: number,
  lineHeight: number, circleObstacles: CircleObstacle[],
): { lines: { x: number; y: number; width: number; slotWidth: number; text: string }[]; cursor: LayoutCursor; textExhausted: boolean } {
  let cursor = startCursor
  let lineTop = regionY
  const lines: { x: number; y: number; width: number; slotWidth: number; text: string }[] = []
  let textExhausted = false
  while (lineTop + lineHeight <= regionY + regionH && !textExhausted) {
    const bandTop = lineTop, bandBottom = lineTop + lineHeight
    const blocked: Interval[] = []
    for (const obs of circleObstacles) {
      const iv = circleIntervalForBand(obs.cx, obs.cy, obs.r, bandTop, bandBottom, obs.hPad, obs.vPad)
      if (iv) blocked.push(iv)
    }
    const slots = carveTextLineSlots({ left: regionX, right: regionX + regionW }, blocked)
    if (slots.length === 0) { lineTop += lineHeight; continue }
    let placedLineInBand = false
    for (const slot of [...slots].sort((a, b) => a.left - b.left)) {
      const slotWidth = slot.right - slot.left
      const line = layoutNextLine(prepared, cursor, slotWidth)
      if (!line) continue
      lines.push({ x: Math.round(slot.left), y: Math.round(lineTop), text: line.text, width: line.width, slotWidth })
      cursor = line.end
      placedLineInBand = true
    }
    if (!placedLineInBand && slots.length === 1) {
      textExhausted = true
    }
    lineTop += lineHeight
  }
  return { lines, cursor, textExhausted }
}

function hitTestOrbs(orbs: Orb[], px: number, py: number): number {
  for (let i = orbs.length - 1; i >= 0; i--) {
    const dx = px - orbs[i].x, dy = py - orbs[i].y
    if (dx * dx + dy * dy <= orbs[i].r * orbs[i].r) return i
  }
  return -1
}

// ── Props ──
export interface TextZone {
  id: string
  text: string
  x: number; y: number; w: number; h: number
  columns: number
  font: string
  lineHeight: number
  breakMode?: 'grapheme' | 'word'
  justify?: boolean
  color?: string
  /** Extra Y offset for column 0 only (pushes first column text down) */
  firstColumnYOffset?: number
}

interface PretextEffectProps {
  active: boolean
  textZones: TextZone[]
}

export default function PretextEffect({ active, textZones }: PretextEffectProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    orbs: Orb[]
    drag: DragState
    lastFrameTime: number | null
    lineEls: HTMLSpanElement[]
    orbEls: HTMLDivElement[]
    preparedTexts: Map<string, PreparedTextWithSegments[]>
    cleanupFns: (() => void)[]
  }>({
    orbs: ORB_DEFS.map(d => ({
      x: d.fx * 960, y: d.fy * 1080,
      vx: d.vx, vy: d.vy, r: d.r,
      paused: false, color: d.color,
    })),
    drag: null,
    lastFrameTime: null,
    lineEls: [],
    orbEls: [],
    preparedTexts: new Map(),
    cleanupFns: [],
  })

  useEffect(() => {
    const stage = stageRef.current
    const st = stateRef.current

    if (!stage || !active) {
      // Hide all elements when not active
      st.lineEls.forEach(el => { el.style.display = 'none' })
      st.orbEls.forEach(el => { el.style.display = 'none' })
      return
    }

    // Re-show orbs when re-activating
    st.orbEls.forEach(el => { el.style.display = '' })
    st.lastFrameTime = null // Reset frame timer to avoid dt jump

    // Wait for custom fonts to load before measuring character widths,
    // otherwise canvas measurements use fallback fonts and produce wrong line breaks
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      // Clear previously prepared texts so they re-measure with loaded fonts
      st.preparedTexts.clear()
      for (const zone of textZones) {
        const key = zone.id + '|' + zone.font + '|' + (zone.breakMode ?? 'grapheme')
        if (!st.preparedTexts.has(key)) {
          // Split by \n into paragraphs, prepare each separately
          const paragraphs = zone.text.split('\n')
          const prepared = paragraphs.map(p => {
            const sourceText = zone.breakMode === 'word' ? p : charBreakable(p)
            return prepareWithSegments(sourceText, zone.font)
          })
          st.preparedTexts.set(key, prepared)
        }
      }
    })

    // Create orb DOM elements with embedded icons
    while (st.orbEls.length < st.orbs.length) {
      const idx = st.orbEls.length
      const el = document.createElement('div')
      const orb = st.orbs[idx]
      const [r, g, b] = orb.color
      const orbDef = ORB_DEFS[idx]
      el.style.cssText = `
        position: absolute; border-radius: 50%; pointer-events: none;
        background: radial-gradient(circle at 35% 35%,
          rgba(${r},${g},${b},0.4), rgba(${r},${g},${b},0.15) 55%, transparent 72%);
        box-shadow: 0 0 60px 15px rgba(${r},${g},${b},0.2), 0 0 120px 40px rgba(${r},${g},${b},0.08);
        transition: opacity 300ms; z-index: 55;
        overflow: hidden;
      `
      // Add icon centered inside orb
      if (orbDef?.icon) {
        const img = document.createElement('img')
        img.src = orbDef.icon
        img.style.cssText = `
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 50%; height: 50%; object-fit: contain;
          opacity: 0.25; pointer-events: none;
        `
        el.appendChild(img)
      }
      stage.appendChild(el)
      st.orbEls.push(el)
    }

    // ── Pointer events with fling physics ──
    const pageContainer = stage.parentElement
    if (!pageContainer) return

    // Track recent pointer positions for velocity calculation
    let pointerHistory: { x: number; y: number; t: number }[] = []
    let didDrag = false

    const getLocalCoords = (e: PointerEvent) => {
      const rect = pageContainer.getBoundingClientRect()
      const scaleX = 960 / rect.width
      const scaleY = 1080 / rect.height
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
    }

    const onPointerDown = (e: PointerEvent) => {
      const pos = getLocalCoords(e)
      const idx = hitTestOrbs(st.orbs, pos.x, pos.y)
      if (idx !== -1) {
        e.preventDefault()
        e.stopPropagation()
        didDrag = false
        pointerHistory = [{ ...pos, t: performance.now() }]
        st.drag = {
          orbIndex: idx,
          startPointerX: pos.x, startPointerY: pos.y,
          startOrbX: st.orbs[idx].x, startOrbY: st.orbs[idx].y,
        }
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const pos = getLocalCoords(e)
      if (st.drag) {
        const orb = st.orbs[st.drag.orbIndex]
        orb.x = st.drag.startOrbX + (pos.x - st.drag.startPointerX)
        orb.y = st.drag.startOrbY + (pos.y - st.drag.startPointerY)

        // Track velocity: keep last 80ms of samples
        const now = performance.now()
        pointerHistory.push({ ...pos, t: now })
        pointerHistory = pointerHistory.filter(p => now - p.t < 80)

        const dx = pos.x - st.drag.startPointerX
        const dy = pos.y - st.drag.startPointerY
        if (dx * dx + dy * dy > 16) didDrag = true
      }
      const idx = hitTestOrbs(st.orbs, pos.x, pos.y)
      pageContainer.style.cursor = st.drag ? 'grabbing' : idx !== -1 ? 'grab' : ''
    }

    const onPointerUp = (e: PointerEvent) => {
      if (st.drag) {
        // Prevent the click from reaching section links after a drag
        e.preventDefault()
        e.stopPropagation()

        const orb = st.orbs[st.drag.orbIndex]

        if (!didDrag) {
          // Click without drag: toggle pause
          orb.paused = !orb.paused
        } else {
          // Fling: calculate velocity from recent pointer history
          const now = performance.now()
          const recent = pointerHistory.filter(p => now - p.t < 80)
          if (recent.length >= 2) {
            const first = recent[0]
            const last = recent[recent.length - 1]
            const dt = (last.t - first.t) / 1000 // seconds
            if (dt > 0.005) {
              const flingScale = 3.0 // amplify the throw
              orb.vx = ((last.x - first.x) / dt) * flingScale
              orb.vy = ((last.y - first.y) / dt) * flingScale
              // Cap velocity
              const maxV = 800
              const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy)
              if (speed > maxV) {
                orb.vx = (orb.vx / speed) * maxV
                orb.vy = (orb.vy / speed) * maxV
              }
              orb.paused = false // unpause if flung
            }
          }
        }

        st.drag = null
        pointerHistory = []
        pageContainer.style.cursor = ''
      }
    }

    // Block click events that fire after pointerup from a drag
    const onClickCapture = (e: MouseEvent) => {
      if (didDrag) {
        e.stopPropagation()
        e.preventDefault()
        didDrag = false
      }
    }

    pageContainer.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, true)
    pageContainer.addEventListener('click', onClickCapture, true)

    // ── Render loop ──
    let rafId = 0

    function render(now: number) {
      const dt = Math.min((now - (st.lastFrameTime ?? now)) / 1000, 0.05)
      st.lastFrameTime = now

      for (const orb of st.orbs) {
        if (orb.paused || (st.drag && st.orbs[st.drag.orbIndex] === orb)) continue
        orb.x += orb.vx * dt
        orb.y += orb.vy * dt
        // Damping: gradually slow down (feels like friction)
        const damping = Math.pow(0.985, dt * 60) // ~0.985 per frame at 60fps
        orb.vx *= damping
        orb.vy *= damping
        // Keep a minimum drift speed so orbs don't stop completely
        const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy)
        if (speed < 15 && speed > 0) {
          const minSpeed = 20
          orb.vx = (orb.vx / speed) * minSpeed
          orb.vy = (orb.vy / speed) * minSpeed
        }
        // Bounce off edges
        if (orb.x - orb.r < 10) { orb.x = 10 + orb.r; orb.vx = Math.abs(orb.vx) }
        if (orb.x + orb.r > 950) { orb.x = 950 - orb.r; orb.vx = -Math.abs(orb.vx) }
        if (orb.y - orb.r < 100) { orb.y = 100 + orb.r; orb.vy = Math.abs(orb.vy) }
        if (orb.y + orb.r > 980) { orb.y = 980 - orb.r; orb.vy = -Math.abs(orb.vy) }
      }

      // Orb-to-orb elastic collision
      for (let i = 0; i < st.orbs.length; i++) {
        for (let j = i + 1; j < st.orbs.length; j++) {
          const a = st.orbs[i], b = st.orbs[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = a.r + b.r + 10
          if (dist >= minDist || dist <= 0.1) continue

          const nx = dx / dist, ny = dy / dist

          // Separate orbs so they don't overlap
          const overlap = minDist - dist
          const halfPush = overlap / 2 + 1
          if (!a.paused) { a.x -= nx * halfPush; a.y -= ny * halfPush }
          if (!b.paused) { b.x += nx * halfPush; b.y += ny * halfPush }

          // Elastic velocity swap along collision normal
          const relVx = a.vx - b.vx
          const relVy = a.vy - b.vy
          const relDotN = relVx * nx + relVy * ny

          // Only resolve if orbs are moving toward each other
          if (relDotN > 0) {
            const restitution = 0.85 // bounciness
            const impulse = relDotN * restitution
            if (!a.paused) { a.vx -= impulse * nx; a.vy -= impulse * ny }
            if (!b.paused) { b.vx += impulse * nx; b.vy += impulse * ny }
          }
        }
      }

      const circleObstacles: CircleObstacle[] = st.orbs.map(orb => ({
        cx: orb.x, cy: orb.y, r: orb.r, hPad: 14, vPad: 4,
      }))

      // Layout all text zones
      const allLines: PositionedLine[] = []

      for (const zone of textZones) {
        const key = zone.id + '|' + zone.font + '|' + (zone.breakMode ?? 'grapheme')
        const preparedParas = st.preparedTexts.get(key)
        if (!preparedParas) continue

        const colCount = zone.columns
        const colGap = colCount > 1 ? 20 : 0
        const colWidth = Math.floor((zone.w - colGap * (colCount - 1)) / colCount)
        const shouldJustify = zone.justify ?? zone.breakMode === 'word'

        // Track current position across columns for paragraph flow
        let col = 0
        let lineTop = zone.y + ((zone.firstColumnYOffset && col === 0) ? zone.firstColumnYOffset : 0)
        let colX = zone.x

        const getColBottom = () => zone.y + zone.h

        for (let pi = 0; pi < preparedParas.length; pi++) {
          const prepared = preparedParas[pi]
          let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
          let textExhausted = false

          // Between paragraphs, just advance to the next line (no blank line, no indent)
          // lineTop is already at the right position from the previous paragraph's last line

          while (!textExhausted && col < colCount) {
            if (lineTop + zone.lineHeight > getColBottom()) {
              col++
              if (col >= colCount) break
              const colYOffset = (col === 0 && zone.firstColumnYOffset) ? zone.firstColumnYOffset : 0
              lineTop = zone.y + colYOffset
              colX = zone.x + col * (colWidth + colGap)
            }

            const bandTop = lineTop, bandBottom = lineTop + zone.lineHeight
            const blocked: Interval[] = []
            for (const obs of circleObstacles) {
              const iv = circleIntervalForBand(obs.cx, obs.cy, obs.r, bandTop, bandBottom, obs.hPad, obs.vPad)
              if (iv) blocked.push(iv)
            }
            const slots = carveTextLineSlots({ left: colX, right: colX + colWidth }, blocked)
            if (slots.length === 0) { lineTop += zone.lineHeight; continue }

            let placedLineInBand = false
            for (const slot of [...slots].sort((a, b) => a.left - b.left)) {
              const slotWidth = slot.right - slot.left
              if (slotWidth <= 0) continue
              const line = layoutNextLine(prepared, cursor, slotWidth)
              if (!line) { textExhausted = true; break }
              allLines.push({
                x: Math.round(slot.left), y: Math.round(lineTop),
                text: line.text, width: line.width, slotWidth,
                font: zone.font, lineHeight: zone.lineHeight,
                color: zone.color || '#1a1a1a',
                justify: shouldJustify,
                isLastLine: false,
              })
              cursor = line.end
              placedLineInBand = true
            }
            if (!placedLineInBand && slots.length === 1) {
              textExhausted = true
            }
            // Only advance lineTop if we actually placed text on this line
            if (placedLineInBand) {
              lineTop += zone.lineHeight
            }
          }

          // Mark the last line of each paragraph as "last line" (don't justify)
          if (allLines.length > 0) {
            allLines[allLines.length - 1].isLastLine = true
          }
        }
      }

      // Sync line DOM elements
      const stageEl = stageRef.current
      if (!stageEl) return
      while (st.lineEls.length < allLines.length) {
        const el = document.createElement('span')
        el.style.cssText = 'position: absolute; white-space: pre; pointer-events: none;'
        stageEl.appendChild(el)
        st.lineEls.push(el)
      }
      for (let i = 0; i < st.lineEls.length; i++) {
        const el = st.lineEls[i]
        if (i < allLines.length) {
          const line = allLines[i]
          el.style.left = `${line.x}px`
          el.style.top = `${line.y}px`
          el.style.font = line.font
          el.style.lineHeight = `${line.lineHeight}px`
          el.style.color = line.color
          el.style.display = ''

          // Justify word-break lines by distributing extra space across word gaps
          if (line.justify && !line.isLastLine && line.slotWidth > 0) {
            const trimmed = line.text.replace(/\s+$/, '')
            const spaces = (trimmed.match(/ /g) || []).length
            if (spaces > 0) {
              const extraSpace = (line.slotWidth - line.width) / spaces
              // Use word-spacing to distribute the extra space
              el.style.wordSpacing = `${extraSpace}px`
              el.textContent = trimmed
            } else {
              el.style.wordSpacing = '0px'
              el.textContent = line.text
            }
          } else {
            el.style.wordSpacing = '0px'
            el.textContent = line.text
          }
        } else {
          el.style.display = 'none'
        }
      }

      // Update orb DOM
      for (let i = 0; i < st.orbs.length; i++) {
        const orb = st.orbs[i], el = st.orbEls[i]
        if (!el) continue
        el.style.left = `${orb.x - orb.r}px`
        el.style.top = `${orb.y - orb.r}px`
        el.style.width = `${orb.r * 2}px`
        el.style.height = `${orb.r * 2}px`
        el.style.opacity = orb.paused ? '0.4' : '1'
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      pageContainer.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp, true)
      pageContainer.removeEventListener('click', onClickCapture, true)
      pageContainer.style.cursor = ''
    }
  }, [active, textZones])

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: 960, height: 1080,
        pointerEvents: 'none',  // Pass through clicks to sections underneath
        zIndex: 50,
        opacity: active ? 1 : 0,
        transition: 'opacity 400ms',
      }}
    />
  )
}
