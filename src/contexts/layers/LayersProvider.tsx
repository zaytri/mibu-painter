import { texture, textureCanvas } from '@/helpers/texture'
import { useCallback, useEffect, useState } from 'react'
import { useModel } from '../model/useModel'
import { LayersContext } from './useLayers'

const PaintEvent = new CustomEvent('paint')

export default function LayersProvider({ children }: React.PropsWithChildren) {
  const { model } = useModel()
  const [canvasLayers, setCanvasLayers] = useState<OffscreenCanvas[]>([
    new OffscreenCanvas(1, 1),
  ])

  useEffect(() => {
    const { texture_width, texture_height } = model.description

    textureCanvas.width = texture_width
    textureCanvas.height = texture_height

    const newCanvasLayers = [
      new OffscreenCanvas(texture_width, texture_height),
      new OffscreenCanvas(texture_width, texture_height),
    ]

    const baseLayer = newCanvasLayers[0].getContext('2d')!
    const image = new Image(texture_width, texture_height)
    image.src = '/textures/player/alex.png'
    image.onload = () => {
      baseLayer.drawImage(image, 0, 0)
      paint()
    }
    image.onerror = console.error

    setCanvasLayers(newCanvasLayers)
  }, [model])

  useEffect(() => {
    paint()
  }, [canvasLayers])

  const paint = useCallback(() => {
    const merged = textureCanvas.getContext('2d')!
    merged.clearRect(0, 0, textureCanvas.width, textureCanvas.height)

    canvasLayers.forEach(layer => {
      merged.drawImage(layer, 0, 0)
    })

    dispatchEvent(PaintEvent)
    texture.needsUpdate = true
  }, [canvasLayers])

  const layers = canvasLayers.map(layer => layer.getContext('2d')!)
  const brushLayer = layers[layers.length - 1]
  const { width, height } = textureCanvas

  return (
    <LayersContext.Provider
      value={{ layers, brushLayer, width, height, paint }}
    >
      {children}
    </LayersContext.Provider>
  )
}
