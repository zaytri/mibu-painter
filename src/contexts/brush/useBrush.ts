import { createContext, useContext } from 'react'

export default function useBrush() {
  return useContext(BrushContext)
}

export const initialState: BrushState = {
  brush: null,
  setBrush() {},
  clearBrush() {},
  draw() {},
  setPainting() {},
  painting: false,
  overCube() {
    return false
  },
}
export const BrushContext = createContext<BrushState>(initialState)

type BrushState = {
  brush: Mibu.Vector2 | null
  setBrush: (x: number, y: number) => void
  clearBrush: () => void
  draw: () => void
  setPainting: (painting: boolean) => void
  painting: boolean
  overCube: (cube: Minecraft.Cube) => boolean
}
