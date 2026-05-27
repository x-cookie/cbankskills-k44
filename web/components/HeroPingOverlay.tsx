'use client'

import { useEffect, useState } from 'react'

// Must match .hero-bg tile dimensions exactly
const TILE_W = 52
const TILE_H = 28
const DX = 18  // diamond half-width  (26→44 in the SVG polygon)
const DY = 10  // diamond half-height (4→24 in the SVG polygon)

const PING_COLOR    = '#C9A227'   // amber-gold — contrasts with --accent green
const PING_MS       = 1900        // single ping lifetime
const SPAWN_EVERY   = 1350        // ms between spawns
const DOUBLE_CHANCE = 0.50        // probability of spawning a second ping shortly after

interface Ping { id: number; x: number; y: number }

let uid = 0

// Build the complete diamond-center grid matching the CSS background tiling
function buildGrid(cols: number, rows: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  for (let r = 0; r <= rows + 1; r++) {
    for (let c = 0; c <= cols + 1; c++) {
      // Layer 1: same origin as background-position 0 0
      pts.push({ x: 26 + c * TILE_W,      y: 14 + r * TILE_H })
      // Layer 2: offset 26px 14px
      pts.push({ x: 26 + c * TILE_W + 26, y: 14 + r * TILE_H + 14 })
    }
  }
  return pts
}

export default function HeroPingOverlay() {
  const [grid, setGrid] = useState<{ x: number; y: number }[]>([])
  const [pings, setPings] = useState<Ping[]>([])

  // Build grid once on mount (client-side dimensions)
  useEffect(() => {
    const cols = Math.ceil(window.innerWidth  / TILE_W) + 1
    const rows = Math.ceil((window.innerHeight - 60) / TILE_H) + 1
    setGrid(buildGrid(cols, rows))
  }, [])

  // Spawn pings at grid positions
  useEffect(() => {
    if (grid.length === 0) return

    const spawn = () => {
      // Prefer the right half of the hero — left side is under the white radial fade
      const visible = grid.filter(p => p.x > window.innerWidth * 0.22)
      const pool = visible.length > 0 ? visible : grid
      const pos = pool[Math.floor(Math.random() * pool.length)]
      const id = uid++
      setPings(prev => [...prev, { id, x: pos.x, y: pos.y }])
      setTimeout(() => setPings(prev => prev.filter(p => p.id !== id)), PING_MS)
    }

    spawn()  // immediate first ping

    const iv = setInterval(() => {
      spawn()
      if (Math.random() < DOUBLE_CHANCE) {
        setTimeout(spawn, 280)
      }
    }, SPAWN_EVERY)

    return () => clearInterval(iv)
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
      {pings.map(p => (
        // Translate to diamond center so scale() animates around the center
        <g key={p.id} transform={`translate(${p.x},${p.y})`}>
          <polygon
            points={`0,${-DY} ${DX},0 0,${DY} ${-DX},0`}
            fill={PING_COLOR}
            stroke={PING_COLOR}
            strokeWidth="0.8"
            style={{ animation: `heroPing ${PING_MS}ms ease-out forwards` }}
          />
        </g>
      ))}

      <style>{`
        @keyframes heroPing {
          0%   { opacity: 0;    transform: scale(0.60); }
          16%  { opacity: 0.62; transform: scale(1.20); }
          50%  { opacity: 0.38; transform: scale(1.00); }
          100% { opacity: 0;    transform: scale(0.78); }
        }
      `}</style>
    </svg>
  )
}
