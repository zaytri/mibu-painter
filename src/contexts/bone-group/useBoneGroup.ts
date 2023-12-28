import { createContext, useContext } from 'react'

export function useBoneGroup() {
  return useContext(BoneGroupContext)
}

export const initialState: Minecraft.BoneGroup = {
  name: 'null',
  pivot: [],
  children: [],
}

export const BoneGroupContext = createContext<Minecraft.BoneGroup>(initialState)
