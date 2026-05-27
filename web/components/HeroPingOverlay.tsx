'use client'

import { useEffect, useRef, useState } from 'react'

const TILE_W = 52
const TILE_H = 28
const DX = 18
const DY = 10

const COLORS = ['#F472B6', '#60A5FA', '#FBBF24'] // pink, blue, yellow

const STEP_MS   = 175  // ms per tile step
const PAUSE_MS  = 3200 // ms between collision events
const BURST_MS  = 600  // collision burst duration

interface Traveler {
  path: { x: number; y: number }[]
  step: number
  color: string
}

interface Collision {
  id: number
  x: number
  y: number
  color1: string
  color2: string
}

let uid = 0

function buildGrid(cols: number, rows: number) {
  const pts: { x: number; y: number }[][] = []
  for (let r = 0; r <= rows + 1; r++) {
    const row: { x: number; y: number }[] = []
    // Layer 1 only for traveler grid (simpler, consistent spacing)
    for (let c = 0; c <= cols + 1; c++) {
      row.push({ x: 26 + c * TILE_W, y: 14 + r * TILE_H })
    }
    pts.push(row)
  }
  return pts
}

function pickTwoColors(): [string, string] {
  const i = Math.floor(Math.random() * COLORS.length)
  let j = Math.floor(Math.random() * (COLORS.length - 1))
  if (j >= i) j++
  return [COLORS[i], COLORS[j]]
}

export default function HeroPingOverlay() {
  const [grid, setGrid] = useState<{ x: number; y: number }[][]>([])
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [collisions, setCollisions] = useState<Collision[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const cols = Math.ceil(window.innerWidth / TILE_W) + 1
    const rows = Math.ceil((window.innerHeight - 60) / TILE_H) + 1
    setGrid(buildGrid(cols, rows))
  }, [])

  useEffect(() => {
    if (grid.length === 0 || grid[0].length === 0) return

    const spawnEvent = () => {
      const rows = grid.length
      const cols = grid[0].length

      // Pick a row in the middle vertical band
      const row = Math.floor(rows * 0.15 + Math.random() * rows * 0.65)

      // Right-bias: start column range in right 55–90% of viewport columns
      const rightStart = Math.floor(cols * 0.55)
      const rightEnd   = Math.floor(cols * 0.90)
      if (rightStart + 6 >= rightEnd) return

      // Meet column: random point within the right zone
      const meetCol = rightStart + 2 + Math.floor(Math.random() * (rightEnd - rightStart - 4))
      const travel  = 3 + Math.floor(Math.random() * 3) // 3–5 tiles each side

      const colLeft  = Math.max(0, meetCol - travel)
      const colRight = Math.min(cols - 1, meetCol + travel)

      if (colLeft >= meetCol || colRight <= meetCol) return

      const [c1, c2] = pickTwoColors()

      // Build paths: left traveler walks right, right traveler walks left
      const pathL: { x: number; y: number }[] = []
      for (let c = colLeft; c <= meetCol; c++) pathL.push(grid[row][c])

      const pathR: { x: number; y: number }[] = []
      for (let c = colRight; c >= meetCol; c--) pathR.push(grid[row][c])

      const tL: Traveler = { path: pathL, step: 0, color: c1 }
      const tR: Traveler = { path: pathR, step: 0, color: c2 }

      setTravelers([tL, tR])

      // Step both travelers forward every STEP_MS
      let step = 0
      const maxSteps = Math.max(pathL.length, pathR.length) - 1

      intervalRef.current = setInterval(() => {
        step++
        if (step >= maxSteps) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null

          // Collision burst at meet point
          const meet = grid[row][meetCol]
          const collId = uid++
          setCollisions(prev => [...prev, { id: collId, x: meet.x, y: meet.y, color1: c1, color2: c2 }])
          setTravelers([])

          setTimeout(() => {
            setCollisions(prev => prev.filter(c => c.id !== collId))
          }, BURST_MS)

          // Schedule next event
          timerRef.current = setTimeout(spawnEvent, PAUSE_MS)
        } else {
          setTravelers([
            { path: pathL, step: Math.min(step, pathL.length - 1), color: c1 },
            { path: pathR, step: Math.min(step, pathR.length - 1), color: c2 },
          ])
        }
      }, STEP_MS)
    }

    // First spawn with short delay
    timerRef.current = setTimeout(spawnEvent, 600)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [grid])

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      {/* Travelers with trail */}
      {travelers.map((t, ti) => (
        t.path.slice(0, t.step + 1).map((pt, pi) => {
          const isHead  = pi === t.step
          const trailAge = t.step - pi // 0=head, 1=first trail, 2=older
          const opacity = isHead ? 0.72 : trailAge === 1 ? 0.28 : 0.10
          if (trailAge > 2) return null
          return (
            <g key={`t${ti}-p${pi}`} transform={`translate(${pt.x},${pt.y})`}>
              <polygon
                points={`0,${-DY} ${DX},0 0,${DY} ${-DX},0`}
                fill={t.color}
                stroke={isHead ? t.color : 'none'}
                strokeWidth={isHead ? 0.8 : 0}
                opacity={opacity}
              />
            </g>
          )
        })
      ))}

      {/* Collision bursts */}
      {collisions.map(col => (
        <g key={col.id} transform={`translate(${col.x},${col.y})`}>
          <polygon
            points={`0,${-DY * 1.8} ${DX * 1.8},0 0,${DY * 1.8} ${-DX * 1.8},0`}
            fill={col.color1}
            style={{ animation: `collisionBurst ${BURST_MS}ms ease-out forwards` }}
          />
          <polygon
            points={`0,${-DY * 1.1} ${DX * 1.1},0 0,${DY * 1.1} ${-DX * 1.1},0`}
            fill={col.color2}
            style={{ animation: `collisionBurst ${BURST_MS}ms ease-out ${BURST_MS * 0.12}ms forwards` }}
          />
        </g>
      ))}

      <style>{`
        @keyframes collisionBurst {
          0%   { opacity: 0;    transform: scale(0.5); }
          18%  { opacity: 0.85; transform: scale(1.5); }
          55%  { opacity: 0.45; transform: scale(1.1); }
          100% { opacity: 0;    transform: scale(0.7); }
        }
      `}</style>
    </svg>
  )
}
