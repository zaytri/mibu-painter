import useBrush from '@/contexts/brush/useBrush'
import { useModel } from '@/contexts/model/useModel'
import { textureCanvas } from '@/helpers/texture'
import useResizeObserver from '@react-hook/resize-observer'
import { useCallback, useEffect, useRef } from 'react'

export default function Preview() {
  const { setPreviewXY, clearPreviewXY, overCube } = useBrush()
  const { model } = useModel()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const devicePixelRatio = window.devicePixelRatio || 1
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio

    const layer = canvas.getContext('2d')!
    layer.scale(devicePixelRatio, devicePixelRatio)

    layer.clearRect(0, 0, width, height)
    layer.imageSmoothingEnabled = false
    const ratio = Math.min(
      width / textureCanvas.width,
      height / textureCanvas.height,
    )

    const scaledWidth = textureCanvas.width * ratio
    const scaledHeight = textureCanvas.height * ratio

    layer.translate((width - scaledWidth) / 2, (height - scaledHeight) / 2)

    layer.fillStyle = 'rgba(100%, 100%, 100%, 10%)'
    layer.fillRect(0, 0, scaledWidth, scaledHeight)

    layer.drawImage(textureCanvas, 0, 0, scaledWidth, scaledHeight)

    layer.beginPath()
    layer.lineWidth = 1
    layer.strokeStyle = 'rgba(0, 0, 0, 25%)'

    const offsetX = scaledWidth / textureCanvas.width
    const offsetY = scaledHeight / textureCanvas.height

    for (let i = 0; i <= textureCanvas.width; i++) {
      const x = offsetX * i
      layer.moveTo(x, 0)
      layer.lineTo(x, scaledHeight)
    }

    for (let i = 0; i <= textureCanvas.height; i++) {
      const y = offsetY * i
      layer.moveTo(0, y)
      layer.lineTo(scaledWidth, y)
    }

    layer.stroke()

    layer.beginPath()
    layer.lineWidth = 2
    layer.strokeStyle = 'black'

    function drawOutline(cube: Minecraft.Cube) {
      const [width, height, depth] = cube.size
      const [x, y] = cube.uv

      const points: Minecraft.UV[] = [
        [x + width * 2 + depth * 2, y + depth + height, -1, -1],
        [x + width * 2 + depth * 2, y + depth, -1, 1],
        [x + width * 2 + depth, y + depth, -1, 1],
        [x + width * 2 + depth, y, -1, 1],
        [x + depth, y, 1, 1],
        [x + depth, y + depth, 1, 1],
        [x, y + depth, 1, 1],
        [x, y + depth + height, 1, -1],
      ].map(point => {
        const [x, y, pixelOffsetX, pixelOffsetY] = point
        return [x * offsetX + pixelOffsetX, y * offsetY + pixelOffsetY]
      })

      const startPoint = points.pop()!
      layer.moveTo(...startPoint)
      points.forEach(point => {
        layer.lineTo(...point)
      })

      layer.closePath()
    }

    let hoveredCube: Minecraft.Cube | null = null

    model.bones.forEach(bone => {
      if (!bone.cubes) return
      bone.cubes.forEach(cube => {
        if (overCube(cube)) hoveredCube = cube
        drawOutline(cube)
      })
    })

    layer.stroke()

    if (hoveredCube) {
      layer.beginPath()
      layer.lineWidth = 2
      layer.strokeStyle = 'white'
      drawOutline(hoveredCube)
      layer.stroke()
    }
  }, [overCube])

  useEffect(() => {
    addEventListener('paint', paint)
    addEventListener('resize', paint)
    return () => {
      removeEventListener('paint', paint)
      removeEventListener('resize', paint)
    }
  }, [])

  useResizeObserver(canvasRef, paint)

  function onPointerMove(event: React.PointerEvent) {
    const canvas = canvasRef.current
    if (!canvas) return

    const { left, top, width, height } = canvas.getBoundingClientRect()
    const ratio = Math.min(
      width / textureCanvas.width,
      height / textureCanvas.height,
    )

    const scaledWidth = textureCanvas.width * ratio
    const scaledHeight = textureCanvas.height * ratio

    const x = Math.floor(
      (event.clientX - left - (width - scaledWidth) / 2) / ratio,
    )
    const y = Math.floor(
      (event.clientY - top - (height - scaledHeight) / 2) / ratio,
    )

    if (x < textureCanvas.width && y < textureCanvas.height) {
      setPreviewXY(x, y)
    } else {
      // out of bounds
      clearPreviewXY()
    }
  }

  function onPointerOut() {
    clearPreviewXY()
  }

  return (
    <canvas
      id='preview'
      ref={canvasRef}
      className='h-full w-full'
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    />
  )
}
