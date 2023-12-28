import useBrush from '@/contexts/brush/useBrush'
import { useModel } from '@/contexts/model/useModel'
import { textureCanvas } from '@/helpers/texture'
import { useEffect, useRef } from 'react'

const paintEvent = 'paint'

export default function Preview() {
  const { setPreviewXY, clearPreviewXY, brushXY, overCube } = useBrush()
  const { model } = useModel()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    function paint() {
      const canvas = canvasRef.current
      if (!canvas) return

      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width
      canvas.height = height

      const layer = canvas.getContext('2d')!
      layer.clearRect(0, 0, width, height)
      layer.imageSmoothingEnabled = false
      const ratio = Math.min(
        width / textureCanvas.width,
        height / textureCanvas.height,
      )

      const scaledWidth = textureCanvas.width * ratio
      const scaledHeight = textureCanvas.height * ratio

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

        const points = [
          [x + width * 2 + depth * 2, y + depth + height],
          [x + width * 2 + depth * 2, y + depth],
          [x + width * 2 + depth, y + depth],
          [x + width * 2 + depth, y],
          [x + depth, y],
          [x + depth, y + depth],
          [x, y + depth],
          [x, y + depth + height],
        ]

        const startPoint = points.pop()!
        layer.moveTo(startPoint[0] * offsetX, startPoint[1] * offsetY)

        points.forEach(point => {
          layer.lineTo(point[0] * offsetX, point[1] * offsetY)
        })

        layer.closePath()
      }

      model.bones.forEach(bone => {
        if (!bone.cubes) return
        bone.cubes.forEach(cube => {
          drawOutline(cube)
        })
      })

      layer.stroke()

      if (brushXY) {
        model.bones.forEach(bone => {
          if (!bone.cubes) return
          for (const cube of bone.cubes) {
            if (overCube(cube)) {
              layer.beginPath()
              layer.lineWidth = 2
              layer.strokeStyle = 'white'

              drawOutline(cube)

              layer.stroke()
              break
            }
          }
        })
      }
    }

    addEventListener(paintEvent, paint)
    return () => {
      removeEventListener(paintEvent, paint)
    }
  }, [brushXY])

  function onPointerMove(event: React.PointerEvent) {
    const canvas = canvasRef.current
    if (!canvas) return

    const { left, top, width, height } = canvas.getBoundingClientRect()
    const ratio = Math.min(
      width / textureCanvas.width,
      height / textureCanvas.height,
    )

    const x = Math.floor((event.clientX - left) / ratio)
    const y = Math.floor((event.clientY - top) / ratio)

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
