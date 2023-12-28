import { createContext, useContext } from 'react'

export function useLayers() {
  return useContext(LayersContext)
}

const defaultLayer = new OffscreenCanvas(1, 1).getContext('2d')!
export const defaultState: LayersState = {
  layers: [defaultLayer],
  brushLayer: defaultLayer,
  paint() {},
  width: 1,
  height: 1,
}

export const LayersContext = createContext<LayersState>(defaultState)

type LayersState = {
  layers: OffscreenCanvasRenderingContext2D[]
  brushLayer: OffscreenCanvasRenderingContext2D
  paint: () => void
  width: number
  height: number
}
