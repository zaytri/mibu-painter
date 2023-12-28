import { createContext, useContext } from 'react'

export default function useBrush() {
  return useContext(BrushContext)
}

export const initialState: BrushState = {
  brushXY: null,
  setPreviewXY() {},
  setModelXY() {},
  clearPreviewXY() {},
  clearModelXY() {},
  draw() {},
  setPainting() {},
  painting: false,
  overCube() {
    return false
  },
}
export const BrushContext = createContext<BrushState>(initialState)

type BrushState = {
  brushXY: Minecraft.UV | null
  setPreviewXY: (x: number, y: number) => void
  setModelXY: (x: number, y: number) => void
  clearPreviewXY: () => void
  clearModelXY: () => void
  draw: () => void
  setPainting: (painting: boolean) => void
  painting: boolean
  overCube: (cube: Minecraft.Cube) => boolean
}
