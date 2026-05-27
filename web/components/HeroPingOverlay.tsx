'use client'

import { useEffect, useRef, useState } from 'react'

const TILE_W = 52
const TILE_H = 28
const DX = 18
const DY = 10

const COLORS = ['#F472B6', '#60A5FA', '#FBBF24'] as const
type Color = (typeof COLORS)[number]

const STEP_MS  = 215   // ms per grid step
const MERGE_MS = 4000  // merged tile hold duration
const PAUSE_MS = 900   // gap after merged fade-out before next event
const ARRIVE_MS = 180  // tile fade-in animation duration
const TRAIL    = 2     // trail tiles behind head

interface GridPt { r: number; c: number; x: number; y: number }
interface TravelerState { id: number; path: GridPt[]; step: number; color: Color }
interface MergedTile    { id: number; x: number; y: number; c1: Color; c2: Color }

let uid = 0

function buildGrid(cols: number, rows: number): GridPt[][] {
  return Array.from({ length: rows + 2 }, (_, r) =>
    Array.from({ length: cols + 2 }, (_, c) => ({
      r, c,
      x: 26 + c * TILE_W,
      y: 14 + r * TILE_H,
    }))
  )
}

function pickTwo(): [Color, Color] {
  const i = Math.floor(Math.random() * COLORS.length)
  let j  = Math.floor(Math.random() * (COLORS.length - 1))
  if (j >= i) j++
  return [COLORS[i], COLORS[j]]
}

/**
 * Wandering path from (sr,sc) → (er,ec) in exactly `budget` steps.
 * The traveler mostly drifts in the right direction but wobbles rows,
 * occasionally backtracks a column, and converges firmly in the final
 * quarter — giving the feel of accidentally ending up at the meeting point.
 */
function wanderPath(
  grid: GridPt[][],
  sr: number, sc: number,
  er: number, ec: number,
  budget: number
): GridPt[] {
  const maxR = grid.length - 1
  const maxC = grid[0].length - 1
  const path: GridPt[] = [grid[sr][sc]]
  let r = sr, c = sc

  for (let i = 0; i < budget; i++) {
    const remaining = budget - i        // steps left (including this one)
    const dr = er - r
    const dc = ec - c
    const dist = Math.abs(dr) + Math.abs(dc)

    // Pad with target if already there
    if (dist === 0) { path.push(grid[er][ec]); continue }

    const mustDirect = dist >= remaining
    let nr = r, nc = c

    if (mustDirect) {
      // Take the most efficient step possible
      if (Math.abs(dc) >= Math.abs(dr)) {
        nc = c + Math.sign(dc)
        if (dr !== 0 && remaining > 1) nr = r + Math.sign(dr)
      } else {
        nr = r + Math.sign(dr)
        if (dc !== 0) nc = c + Math.sign(dc)
      }
    } else {
      const slack = remaining - dist
      const roll  = Math.random()

      if (roll < 0.40) {
        // Primary axis progress, optional row tag-along
        if (Math.abs(dc) >= Math.abs(dr)) {
          nc = c + Math.sign(dc)
          if (dr !== 0 && Math.random() < 0.45) nr = r + Math.sign(dr)
        } else {
          nr = r + Math.sign(dr)
          if (dc !== 0 && Math.random() < 0.45) nc = c + Math.sign(dc)
        }
      } else if (roll < 0.58) {
        // Row wander — lateral drift, slight col nudge
        nr = r + (Math.random() < 0.5 ? 1 : -1)
        if (dc !== 0 && Math.random() < 0.30) nc = c + Math.sign(dc)
      } else if (roll < 0.74) {
        // Diagonal drift: col progress + row wobble
        if (dc !== 0) nc = c + Math.sign(dc)
        nr = r + (Math.random() < 0.5 ? 1 : -1)
      } else if (slack > 3 && roll < 0.87) {
        // Brief col backtrack (indecision moment) + row progress
        if (dc !== 0) nc = c - Math.sign(dc)
        nr   = r + (dr !== 0 ? Math.sign(dr) : (Math.random() < 0.5 ? 1 : -1))
      } else {
        // Pure row wander
        nr = r + (Math.random() < 0.5 ? 1 : -1)
      }
    }

    nr = Math.max(0, Math.min(maxR, nr))
    nc = Math.max(0, Math.min(maxC, nc))
    r = nr; c = nc
    path.push(grid[r][c])
  }

  // Guarantee path ends at target
  path.push(grid[er][ec])
  return path
}

export default function HeroPingOverlay() {
  const [grid,     setGrid]     = useState<GridPt[][]>([])
  const [travelers, setTravelers] = useState<TravelerState[]>([])
  const [merged,    setMerged]   = useState<MergedTile | null>(null)

  const alive   = useRef(true)
  const stepIv  = useRef<ReturnType<typeof setInterval> | null>(null)
  const schedT  = useRef<ReturnType<typeof setTimeout>  | null>(null)

  // Build grid from viewport dimensions once on mount
  useEffect(() => {
    const cols = Math.ceil(window.innerWidth  / TILE_W) + 1
    const rows = Math.ceil((window.innerHeight - 60) / TILE_H) + 1
    setGrid(buildGrid(cols, rows))
  }, [])

  useEffect(() => {
    if (!grid.length || !grid[0].length) return
    alive.current = true

    const later = (fn: () => void, ms: number) => {
      schedT.current = setTimeout(fn, ms)
    }

    const spawnEvent = () => {
      if (!alive.current) return
      const rows = grid.length
      const cols = grid[0].length

      // Keep travelers in right half — green cubes live at x≈165–510 (left half)
      const lo = Math.floor(cols * 0.52)
      const hi = Math.floor(cols * 0.90)
      if (lo + 10 > hi) return

      const meetR = Math.floor(rows * 0.12 + Math.random() * rows * 0.60)
      const meetC = lo + 3 + Math.floor(Math.random() * (hi - lo - 5))
      const spread = 4 + Math.floor(Math.random() * 3)          // 4–6 tiles each side
      const budget = spread + 5 + Math.floor(Math.random() * 5) // extra steps for wandering

      // Start rows can differ from meetR (±0–3 rows) — paths converge diagonally
      const clampR = (v: number) => Math.max(0, Math.min(rows - 1, v))
      const startRA = clampR(meetR + Math.round((Math.random() - 0.5) * 5))
      const startRB = clampR(meetR + Math.round((Math.random() - 0.5) * 5))
      const startCA = Math.max(0,        meetC - spread)
      const startCB = Math.min(cols - 1, meetC + spread)

      const [c1, c2] = pickTwo()
      const pathA = wanderPath(grid, startRA, startCA, meetR, meetC, budget)
      const pathB = wanderPath(grid, startRB, startCB, meetR, meetC, budget)

      const idA = uid++
      const idB = uid++
      setTravelers([
        { id: idA, path: pathA, step: 0, color: c1 },
        { id: idB, path: pathB, step: 0, color: c2 },
      ])

      let step = 0
      const maxStep = Math.max(pathA.length, pathB.length) - 1

      stepIv.current = setInterval(() => {
        if (!alive.current) { clearInterval(stepIv.current!); return }
        step++

        if (step >= maxStep) {
          clearInterval(stepIv.current!)
          stepIv.current = null
          setTravelers([])

          // Show merged tile
          const mt  = grid[meetR][meetC]
          const mid = uid++
          setMerged({ id: mid, x: mt.x, y: mt.y, c1, c2 })

          later(() => {
            if (!alive.current) return
            setMerged(null)
            later(spawnEvent, PAUSE_MS)
          }, MERGE_MS)
        } else {
          setTravelers([
            { id: idA, path: pathA, step: Math.min(step, pathA.length - 1), color: c1 },
            { id: idB, path: pathB, step: Math.min(step, pathB.length - 1), color: c2 },
          ])
        }
      }, STEP_MS)
    }

    later(spawnEvent, 700)

    return () => {
      alive.current = false
      if (stepIv.current) clearInterval(stepIv.current)
      if (schedT.current)  clearTimeout(schedT.current)
    }
  }, [grid])

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      {/* Travelers: head fades in, trail fades with CSS transition */}
      {travelers.map(t =>
        t.path.slice(0, t.step + 1).map((pt, pi) => {
          const age    = t.step - pi
          if (age > TRAIL) return null
          const isHead = age === 0
          const op     = isHead ? 0.80 : age === 1 ? 0.32 : 0.12
          return (
            <g key={`${t.id}-${pi}`} transform={`translate(${pt.x},${pt.y})`}>
              <polygon
                points={`0,${-DY} ${DX},0 0,${DY} ${-DX},0`}
                fill={t.color}
                stroke={isHead ? t.color : 'none'}
                strokeWidth={isHead ? 0.9 : 0}
                style={{
                  opacity: op,
                  // transition handles trail opacity decay; animation overrides it for head arrival
                  transition: 'opacity 140ms ease',
                  animation:  isHead ? `tileArrive ${ARRIVE_MS}ms ease-out` : 'none',
                }}
              />
            </g>
          )
        })
      )}

      {/* Merged tile — bursts in, glows for 4 s, fades out */}
      {merged && (
        <g key={merged.id} transform={`translate(${merged.x},${merged.y})`}>
          {/* Outer halo */}
          <polygon
            points={`0,${-DY * 1.8} ${DX * 1.8},0 0,${DY * 1.8} ${-DX * 1.8},0`}
            fill={merged.c1}
            style={{ animation: `mergedOuter ${MERGE_MS}ms ease-in-out forwards` }}
          />
          {/* Inner core */}
          <polygon
            points={`0,${-DY} ${DX},0 0,${DY} ${-DX},0`}
            fill={merged.c2}
            style={{ animation: `mergedInner ${MERGE_MS}ms ease-in-out forwards` }}
          />
        </g>
      )}

      <style>{`
        /* New tile fades + pops in */
        @keyframes tileArrive {
          0%   { opacity: 0;    transform: scale(0.40); }
          55%  { opacity: 0.95; transform: scale(1.12); }
          100% { opacity: 0.80; transform: scale(1.00); }
        }

        /* Outer halo: burst large → settle → hold → fade */
        @keyframes mergedOuter {
          0%   { opacity: 0;    transform: scale(0.30); }
          7%   { opacity: 1.00; transform: scale(1.80); }
          16%  { opacity: 0.88; transform: scale(1.40); }
          72%  { opacity: 0.80; transform: scale(1.35); }
          88%  { opacity: 0.30; transform: scale(1.25); }
          100% { opacity: 0;    transform: scale(1.15); }
        }

        /* Inner core: burst slightly later → hold bright → fade */
        @keyframes mergedInner {
          0%   { opacity: 0;    transform: scale(0.20); }
          10%  { opacity: 1.00; transform: scale(1.25); }
          20%  { opacity: 0.92; transform: scale(1.00); }
          72%  { opacity: 0.88; transform: scale(1.00); }
          88%  { opacity: 0.38; transform: scale(0.95); }
          100% { opacity: 0;    transform: scale(0.85); }
        }
      `}</style>
    </svg>
  )
}
