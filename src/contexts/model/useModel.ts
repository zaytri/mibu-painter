import playerSlim from '@/models/player_slim.geo.json'
import { createContext, useContext } from 'react'

export function useModel() {
  return useContext(ModelContext)
}

export const initialState: ModelState = {
  model: playerSlim['minecraft:geometry'][0],
  loading: false,
  async loadModel() {},
}
export const ModelContext = createContext<ModelState>(initialState)

type ModelState = {
  model: Minecraft.Geometry
  loading: boolean
  loadModel: (modelFile: string | File) => Promise<void>
}
