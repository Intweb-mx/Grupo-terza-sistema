'use client'

import { useEffect, useRef, useState } from 'react'

// Anima un número de 0 al valor final al montar. Sin librería — un
// requestAnimationFrame con easing manual. Con prefers-reduced-motion la
// duración efectiva es 0 (salta directo al valor final en el primer frame,
// sin setState síncrono dentro del efecto).
export function CountUp({
  value,
  format,
  durationMs = 900,
}: {
  value: number
  format: (n: number) => string
  durationMs?: number
}) {
  const [mostrado, setMostrado] = useState(0)
  const yaAnimo = useRef(false)

  useEffect(() => {
    if (yaAnimo.current) return
    yaAnimo.current = true

    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duracionEfectiva = reducido ? 0 : durationMs

    let frame: number
    const inicio = performance.now()

    function tick(ahora: number) {
      const progreso = duracionEfectiva === 0 ? 1 : Math.min(1, (ahora - inicio) / duracionEfectiva)
      const easeOutCubic = 1 - Math.pow(1 - progreso, 3)
      setMostrado(Math.round(value * easeOutCubic))
      if (progreso < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{format(mostrado)}</>
}
