'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import { cn } from '../../lib/utils'

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 0, 0)',
  width,
  height,
  className,
  maxOpacity = 0.3,
  fps = 20, 
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const inViewRef = useRef(false)
  const rafRef = useRef(null)
  const dprRef = useRef(1)
  const gridRef = useRef(null)
  const lastFrameRef = useRef(0)
  const frameIntervalRef = useRef(1000 / fps)

  const rgbaPrefix = useMemo(() => {
    try {
      const c = document.createElement('canvas')
      c.width = c.height = 1
      const ctx = c.getContext('2d')
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    } catch {
      return 'rgba(0,0,0,'
    }
  }, [color])

  const setupCanvas = (canvas, w, h) => {
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    dprRef.current = dpr
    
    canvas.width = Math.max(1, Math.floor(w * dpr))
    canvas.height = Math.max(1, Math.floor(h * dpr))
    
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const cols = Math.max(1, Math.floor(w / (squareSize + gridGap)))
    const rows = Math.max(1, Math.floor(h / (squareSize + gridGap)))
    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity
    gridRef.current = { cols, rows, squares }
  }

  const updateSquares = (squares, effectiveChance) => {
    for (let i = 0; i < squares.length; i++) {
      if (Math.random() < effectiveChance) {
        squares[i] = Math.random() * maxOpacity
      }
    }
  }

  const draw = (ctx, w, h) => {
    const grid = gridRef.current
    if (!grid) return
    const { cols, rows, squares } = grid
    const dpr = dprRef.current

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const step = squareSize + gridGap
    for (let i = 0; i < cols; i++) {
      const x = i * step
      for (let j = 0; j < rows; j++) {
        const y = j * step
        const opacity = squares[i * rows + j]
        if (opacity <= 0) continue
        ctx.fillStyle = `${rgbaPrefix}${opacity})`
        ctx.fillRect(x, y, squareSize, squareSize)
      }
    }
    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const getSize = () => ({
      w: width ?? container.clientWidth,
      h: height ?? container.clientHeight,
    })

    const resize = () => {
      const { w, h } = getSize()
      setupCanvas(canvas, w, h)
      draw(ctx, w, h)
    }
    resize()

    let roId = null
    const ro = new ResizeObserver(() => {
      if (roId) cancelAnimationFrame(roId)
      roId = requestAnimationFrame(resize)
    })
    ro.observe(container)

    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting
        lastFrameRef.current = performance.now()
      },
      { threshold: 0 }
    )
    io.observe(container)

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop)
      if (!inViewRef.current) return

      const last = lastFrameRef.current || now
      const elapsed = now - last
      if (elapsed < frameIntervalRef.current) return
      lastFrameRef.current = now

      const dt = Math.min(elapsed / 1000, 1 / 20) 
      const lambda = Math.max(0, flickerChance)
      const effectiveChance = 1 - Math.exp(-lambda * dt)

      const grid = gridRef.current
      if (grid) {
        updateSquares(grid.squares, effectiveChance)
        const { w, h } = getSize()
        draw(ctx, w, h)
      }
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      io.disconnect()
    }
  }, [squareSize, gridGap, maxOpacity, flickerChance, rgbaPrefix, width, height, fps])

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full h-full pointer-events-none',
        'contain-[paint] will-change-opacity',
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
