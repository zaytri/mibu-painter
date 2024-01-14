import BoneGroupProvider from '@/contexts/bone-group/BoneGroupProvider'
import useBrush from '@/contexts/brush/useBrush'
import { useModel } from '@/contexts/model/useModel'
import useRaycaster from '@/hooks/useRaycaster'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { type OrbitControls as OrbitControlsType } from 'three-stdlib'
import Bone from './Bone'

type ModelProps = {
  rotation: Mibu.Vector3
}

export default function Model({ rotation }: ModelProps) {
  useRaycaster()
  const { model } = useModel()
  const [defaultZoom, setDefaultZoom] = useState(0)
  const { camera, invalidate, size } = useThree()
  const { painting } = useBrush()
  const controlsRef = useRef<OrbitControlsType>(null)

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
    const controls = controlsRef.current
    if (!controls) return
    const cameraZ =
      Math.max(
        ...modelMaxCoords.map(coord => Math.abs(coord)),
        ...modelMinCoords.map(coord => Math.abs(coord)),
      ) * 2
    const canvasMinDimension = Math.floor(Math.min(size.width, size.height))
    const cameraY = modelMaxCoords[1] / 2
    camera.position.set(0, cameraY, cameraZ)
    setDefaultZoom(canvasMinDimension / cameraZ)
    controls.target.set(0, cameraY, 0)
    controls.update()
    invalidate()
  }, [model, controlsRef.current])

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

  const pivotX = (modelMaxCoords[0] + modelMinCoords[0]) / 2
  const pivotY = (modelMaxCoords[1] + modelMinCoords[1]) / 2
  const pivotZ = -(modelMaxCoords[2] + modelMinCoords[2]) / 2

  return (
    <>
      <OrbitControls
        enableDamping={false}
        enableRotate={false}
        enabled={!painting}
        ref={controlsRef}
        position={[0, 0, 100]}
        zoomToCursor
      />
      <OrthographicCamera makeDefault zoom={defaultZoom} />
      <group
        rotation={rotation}
        name='model pivot'
        position={[pivotX, pivotY, pivotZ]}
      >
        <group name='model' position={[-pivotX, -pivotY, -pivotZ]}>
          {boneGroups.map(boneGroup => {
            return (
              <BoneGroupProvider key={boneGroup.name} group={boneGroup}>
                <Bone />
              </BoneGroupProvider>
            )
          })}
        </group>
      </group>
    </>
  )
}
