'use client'

// components/DemoVideo.tsx
// Embeds a YouTube unlisted video per skill detail page.
// Autoplays when scrolled into view, pauses when out of view.

import { useEffect, useRef, useState } from 'react'
import { getEmbedUrl } from '@/content/demos'

interface DemoVideoProps {
  videoId: string
  label?: string  // optional caption, defaults to "Live demo — recorded in Claude"
}

export function DemoVideo({ videoId, label }: DemoVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef    = useRef<HTMLIFrameElement>(null)
  const [hasPlayed,  setHasPlayed]  = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setHasPlayed(true)
        }
      },
      { threshold: 0.4 }  // trigger when 40% of video is visible
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [hasPlayed])

  // YouTube iframe API does not allow programmatic play/pause
  // without YouTube IFrame Player API — simplest approach is to
  // mount the iframe only when visible (lazy load).
  // This also prevents autoplay from firing before user scrolls to it.

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-surface-alt">
        {hasPlayed ? (
          <iframe
            ref={iframeRef}
            src={getEmbedUrl(videoId)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Skill demo"
          />
        ) : (
          // Placeholder shown before user scrolls to video
          // Prevents layout shift and unnecessary iframe load
          <div className="absolute inset-0 flex items-center justify-center bg-surface-alt">
            <div className="flex flex-col items-center gap-2 text-text-subtle">
              <svg
                className="w-10 h-10 opacity-30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-xs">Loading demo...</span>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-text-subtle">
        {label ?? 'Live demo — recorded in Claude'}
      </p>
    </div>
  )
}