import BoneGroupProvider from '@/contexts/bone-group/BoneGroupProvider'
import { useBoneGroup } from '@/contexts/bone-group/useBoneGroup'
import Cube from './Cube'

export default function Bone() {
  const bone = useBoneGroup()

  const pivotX = bone.pivot[0]
  const pivotY = bone.pivot[1]
  const pivotZ = bone.pivot[2] * -1

  return (
    <group
      name={`${bone.name} pivot`}
      position={[pivotX, pivotY, pivotZ]}
      rotation={
        bone.rotation
          ? [
              (bone.rotation[0] * Math.PI) / 180,
              -(bone.rotation[1] * Math.PI) / 180,
              -(bone.rotation[2] * Math.PI) / 180,
              'ZYX',
            ]
          : undefined
      }
    >
      <group name={bone.name} position={[-pivotX, -pivotY, -pivotZ]}>
        {bone.children.map(boneGroup => {
          return (
            <BoneGroupProvider key={boneGroup.name} group={boneGroup}>
              <Bone />
            </BoneGroupProvider>
          )
        })}
        {bone.cubes &&
          bone.cubes.map((cube, index) => {
            return (
              <Cube
                key={index}
                {...cube}
                mirror={cube.mirror === undefined ? bone.mirror : cube.mirror}
              />
            )
          })}
      </group>
    </group>
  )
}
