import { useCallback, useEffect, useState } from 'react'
import { useLayers } from '../layers/useLayers'
import { BrushContext } from './useBrush'

export default function BrushProvider({ children }: React.PropsWithChildren) {
  const { brushLayer, layers, paint, width, height } = useLayers()
  const [previewX, setPreviewX] = useState<number | null>(null)
  const [previewY, setPreviewY] = useState<number | null>(null)
  const [modelX, setModelX] = useState<number | null>(null)
  const [modelY, setModelY] = useState<number | null>(null)
  const [painting, setPainting] = useState(false)
  const brushXY: Minecraft.UV | null =
    previewX !== null && previewY !== null
      ? [previewX, previewY]
      : modelX !== null && modelY !== null
        ? [modelX, modelY]
        : null

  const drawBrush = useCallback(
    (layer: OffscreenCanvasRenderingContext2D) => {
      if (!brushXY) return

      layer.fillStyle = 'red'
      layer.fillRect(brushXY[0], brushXY[1], 1, 1)
      paint()
    },
    [brushXY],
  )

  const overCube = useCallback(
    (cube: Minecraft.Cube) => {
      if (!brushXY) return false

      const [width, height, depth] = cube.size
      const [u, v] = cube.uv
      const [x, y] = brushXY

      const boundedX1 = x >= u + depth && x < u + depth + width * 2
      const boundedY1 = y >= v && y < v + depth
      const boundedX2 = x >= u && x < u + depth * 2 + width * 2
      const boundedY2 = y >= v + depth && y < v + depth + height

      return (boundedX1 && boundedY1) || (boundedX2 && boundedY2)
    },
    [brushXY],
  )

  const setPaintingCallback = useCallback(
    (state: boolean) => {
      if ([previewX, previewY, modelX, modelY].every(coord => coord === null)) {
        setPainting(false)
      } else {
        setPainting(state)
      }
    },
    [previewX, previewY, modelX, modelY],
  )

  useEffect(() => {
    brushLayer.clearRect(0, 0, width, height)
    drawBrush(brushLayer)
  }, [previewX, previewY, modelX, modelY])

  function setPreviewXY(newX: number, newY: number) {
    setPreviewX(newX)
    setPreviewY(newY)
  }

  function setModelXY(newX: number, newY: number) {
    setModelX(newX)
    setModelY(newY)
  }

  function clearPreviewXY() {
    setPreviewX(null)
    setPreviewY(null)
  }

  function clearModelXY() {
    setModelX(null)
    setModelY(null)
  }

  function draw() {
    drawBrush(layers[0])
  }

  return (
    <BrushContext.Provider
      value={{
        brushXY,
        draw,
        setModelXY,
        setPreviewXY,
        clearPreviewXY,
        clearModelXY,
        painting,
        setPainting: setPaintingCallback,
        overCube,
      }}
    >
      {children}
    </BrushContext.Provider>
  )
}
