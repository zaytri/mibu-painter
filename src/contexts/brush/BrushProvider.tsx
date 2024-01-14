import { useCallback, useEffect, useRef, useState } from 'react'
import { useLayers } from '../layers/useLayers'
import { BrushContext } from './useBrush'

export default function BrushProvider({ children }: React.PropsWithChildren) {
  const { brushLayer, layers, paint, width, height } = useLayers()
  const [x, setX] = useState<number | null>(null)
  const [y, setY] = useState<number | null>(null)
  const [painting, setPainting] = useState(false)
  const brushRef = useRef<Mibu.Vector2 | null>(null)
  brushRef.current = x !== null && y !== null ? [x, y] : null

  const drawBrush = useCallback(
    (layer: OffscreenCanvasRenderingContext2D) => {
      layer.fillStyle = 'gray'
      if (brushRef.current) {
        const [x, y] = brushRef.current
        layer.fillRect(x, y, 1, 1)
      }
      paint()
    },
    [brushRef.current],
  )

  const overCube = useCallback(
    (cube: Minecraft.Cube) => {
      if (!brushRef.current) return false

      const [width, height, depth] = cube.size
      const [u, v] = cube.uv
      const [x, y] = brushRef.current

      const boundedX1 = x >= u + depth && x < u + depth + width * 2
      const boundedY1 = y >= v && y < v + depth
      const boundedX2 = x >= u && x < u + depth * 2 + width * 2
      const boundedY2 = y >= v + depth && y < v + depth + height

      return (boundedX1 && boundedY1) || (boundedX2 && boundedY2)
    },
    [brushRef.current],
  )

  const setPaintingCallback = useCallback(
    (state: boolean) => {
      if (!brushRef.current) {
        setPainting(false)
      } else {
        setPainting(state)
      }
    },
    [brushRef.current],
  )

  useEffect(() => {
    brushLayer.clearRect(0, 0, width, height)
    drawBrush(brushLayer)
  }, [brushRef.current])

  function setBrush(newX: number, newY: number) {
    setX(newX)
    setY(newY)
  }

  function clearBrush() {
    setX(null)
    setY(null)
  }

  function draw() {
    drawBrush(layers[0])
  }

  return (
    <BrushContext.Provider
      value={{
        brush: brushRef.current,
        draw,
        setBrush,
        clearBrush,
        painting,
        setPainting: setPaintingCallback,
        overCube,
      }}
    >
      {children}
    </BrushContext.Provider>
  )
}
