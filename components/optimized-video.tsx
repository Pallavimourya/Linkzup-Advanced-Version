'use client'

import { useState, useRef, useEffect } from 'react'

interface OptimizedVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  onLoadStart?: (() => void) | undefined
  onCanPlay?: (() => void) | undefined
}

export function OptimizedVideo({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  onLoadStart,
  onCanPlay
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(video)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const handleLoadStart = () => {
    if (onLoadStart) {
      onLoadStart()
    }
  }

  const handleCanPlay = () => {
    setIsLoaded(true)
    if (onCanPlay) {
      onCanPlay()
    }
  }

  const handleLoadedData = () => {
    setIsLoaded(true)
  }

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay={autoPlay && isInView}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      preload={isInView ? 'metadata' : 'none'}
      onLoadStart={handleLoadStart}
      onCanPlay={handleCanPlay}
      onLoadedData={handleLoadedData}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {isInView && <source src={src} type="video/mp4" />}
      Your browser does not support the video tag.
    </video>
  )
}
