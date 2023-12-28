import { BoneGroupContext } from './useBoneGroup'

type BoneGroupProviderProps = {
  group: Minecraft.BoneGroup
}

export default function BoneGroupProvider({
  children,
  group,
}: React.PropsWithChildren<BoneGroupProviderProps>) {
  return (
    <BoneGroupContext.Provider value={group}>
      {children}
    </BoneGroupContext.Provider>
  )
}
