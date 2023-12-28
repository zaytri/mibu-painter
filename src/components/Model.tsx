import BoneGroupProvider from '@/contexts/bone-group/BoneGroupProvider'
import { useModel } from '@/contexts/model/useModel'
import useRaycaster from '@/hooks/useRaycaster'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import Bone from './Bone'

const vectorX = new Vector3(1, 0, 0)
const vectorY = new Vector3(0, 1, 0)
const vectorZ = new Vector3(0, 0, 1)
const origin = new Vector3(0, 0, 0)

export default function Model() {
  useRaycaster()
  const { model } = useModel()
  const { camera } = useThree()

  const modelMinCoords = [Infinity, Infinity, Infinity]
  const modelMaxCoords = [-Infinity, -Infinity, -Infinity]
  const boneMap: Minecraft.BoneMap = new Map()

  model.bones.forEach(bone => {
    boneMap.set(bone.name, { ...bone })

    if (!bone.cubes) return
    bone.cubes.forEach(cube => {
      for (let i = 0; i < 3; i++) {
        modelMinCoords[i] = Math.min(cube.origin[i], modelMinCoords[i])
        modelMaxCoords[i] = Math.max(
          cube.origin[i] + cube.size[i],
          modelMaxCoords[i],
        )
      }
    })
  })

  useEffect(() => {
    const cameraDistance =
      1 *
      Math.max(
        ...modelMaxCoords,
        ...modelMinCoords.map(coord => Math.abs(coord)),
      )
    camera.position.setZ(cameraDistance)
  }, [model])

  const boneGroups: Minecraft.BoneGroup[] = []
  model.bones.forEach(bone => {
    if (!bone.parent) {
      boneGroups.push({ ...bone, children: [] })
    } else {
      const parents: string[] = []
      let currentBone = bone
      while (currentBone.parent) {
        parents.push(currentBone.parent)
        currentBone = boneMap.get(currentBone.parent)!
      }

      let parentGroup: Minecraft.BoneGroup | null = null
      parents.reverse().forEach(parentName => {
        const groupArray = parentGroup ? parentGroup.children : boneGroups
        parentGroup = groupArray.find(group => group.name === parentName)!
      })

      parentGroup!.children.push({ ...bone, children: [] })
    }
  })

  return (
    <group
      name='model'
      position={[
        -(modelMaxCoords[0] + modelMinCoords[0]) / 2,
        -(modelMaxCoords[1] + modelMinCoords[1]) / 2,
        (modelMaxCoords[2] + modelMinCoords[2]) / 2,
      ]}
    >
      {boneGroups.map(boneGroup => {
        return (
          <BoneGroupProvider key={boneGroup.name} group={boneGroup}>
            <Bone />
          </BoneGroupProvider>
        )
      })}
      <gridHelper args={[256, 32]} />
      <arrowHelper
        args={[vectorX, origin, modelMaxCoords[0] + 5, 'red', 2, 1]}
        position={[0, 0.01, 0]}
      />
      <arrowHelper
        args={[vectorY, origin, modelMaxCoords[1] + 5, 'green', 2, 1]}
      />
      <arrowHelper
        args={[vectorZ, origin, modelMaxCoords[2] + 5, 'blue', 2, 1]}
        position={[0, 0.01, 0]}
      />
    </group>
  )
}
