import axolotlModel from '@/models/axolotl.geo.json'
import camelModel from '@/models/camel.geo.json'
import dragonModel from '@/models/ender_dragon.geo.json'
import guardianModel from '@/models/guardian.geo.json'
import playerModel from '@/models/player.geo.json'
import playerSlimModel from '@/models/player_slim.geo.json'
import { Canvas, useLoader } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import { Suspense, memo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  return (
    <Suspense fallback={null}>
      <Model />
    </Suspense>
  )
}

function Model() {
  const textures = [
    useLoader(THREE.TextureLoader, 'skin.png'),
    useLoader(THREE.TextureLoader, 'skin2.png'),
    useLoader(THREE.TextureLoader, 'camel.png'),
    useLoader(THREE.TextureLoader, 'axolotl_blue.png'),
    useLoader(THREE.TextureLoader, 'axolotl_cyan.png'),
    useLoader(THREE.TextureLoader, 'axolotl_gold.png'),
    useLoader(THREE.TextureLoader, 'axolotl_lucy.png'),
    useLoader(THREE.TextureLoader, 'axolotl_wild.png'),
    useLoader(THREE.TextureLoader, 'guardian.png'),
    useLoader(THREE.TextureLoader, 'dragon.png'),
  ]
  const models = [
    playerSlimModel,
    playerModel,
    camelModel,
    axolotlModel,
    axolotlModel,
    axolotlModel,
    axolotlModel,
    axolotlModel,
    guardianModel,
    dragonModel,
  ]
  textures.forEach(texture => {
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
  })

  const [toggled, setToggled] = useState(false)
  const [index, setIndex] = useState(2)
  const rotateIndex = true

  const [rotation, setRotation] = useState<[number, number, number]>([
    Math.PI / 8,
    Math.PI / 8,
    0,
  ])

  const bind = useDrag(({ delta: [dx, dy] }) => {
    const newRotation: [number, number, number] = [...rotation]
    newRotation[0] += dy / 40
    newRotation[0] = THREE.MathUtils.clamp(
      newRotation[0],
      -Math.PI / 2,
      Math.PI / 2,
    )
    newRotation[1] += dx / 40
    setRotation(newRotation)
  })

  const modelMinCoords = [Infinity, Infinity, Infinity]
  const modelMaxCoords = [-Infinity, -Infinity, -Infinity]
  models[index]['minecraft:geometry'][0].bones.forEach(bone => {
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

  const cameraDistance =
    -1.5 *
    Math.max(...modelMaxCoords, ...modelMinCoords.map(coord => Math.abs(coord)))

  return (
    <div className=' h-full w-full border border-white'>
      <Canvas
        frameloop='demand'
        onClick={() => {
          setToggled(!toggled)
          if (rotateIndex) setIndex((index + 1) % models.length)
        }}
        {...bind()}
        className=' touch-none'
      >
        <ambientLight intensity={5} />
        <pointLight position={[10, 10, 10]} />
        <group
          rotation={rotation}
          position={[0, 0, cameraDistance]}
          renderOrder={10}
        >
          <axesHelper args={[500]} visible={false} />
        </group>
        <group rotation={rotation} position={[0, 0, cameraDistance]}>
          <group
            position={[
              -(modelMaxCoords[0] + modelMinCoords[0]) / 2,
              -(modelMaxCoords[1] + modelMinCoords[1]) / 2,
              (modelMaxCoords[2] + modelMinCoords[2]) / 2,
            ]}
          >
            <box3Helper
              box={
                new THREE.Box3(
                  new THREE.Vector3(
                    modelMinCoords[0],
                    modelMinCoords[1],
                    -modelMaxCoords[2],
                  ),
                  new THREE.Vector3(
                    modelMaxCoords[0],
                    modelMaxCoords[1],
                    -modelMinCoords[2],
                  ),
                )
              }
              visible={false}
            />
            <MinecraftModel
              model={models[index]}
              texture={textures[index]}
              scale={1}
            />
          </group>
        </group>
      </Canvas>
    </div>
  )
}

type MinecraftModelProps = {
  model: Minecraft.Model
  texture: THREE.Texture
  scale: number
}

const MinecraftModel = memo(function MinecraftModel({
  model,
  texture,
}: MinecraftModelProps) {
  const [minecraftGeometry] = model['minecraft:geometry']

  const boneMap: Minecraft.BoneMap = new Map()
  minecraftGeometry.bones.forEach(bone => {
    boneMap.set(bone.name, { ...bone })
  })

  const groups: Minecraft.Group[] = []
  minecraftGeometry.bones.forEach(bone => {
    if (!bone.parent) {
      groups.push({ ...bone, children: [] })
    } else {
      const parents: string[] = []
      let currentBone = bone
      while (currentBone.parent) {
        parents.push(currentBone.parent)
        currentBone = boneMap.get(currentBone.parent)!
      }

      let parentGroup: Minecraft.Group | null = null
      parents.reverse().forEach(parentName => {
        const groupArray = parentGroup ? parentGroup.children : groups
        parentGroup = groupArray.find(group => group.name === parentName)!
      })

      parentGroup!.children.push({ ...bone, children: [] })
    }
  })

  return groups.map((group, index) => {
    return (
      <Group
        key={group.name}
        group={group}
        minecraftGeometry={minecraftGeometry}
        texture={texture}
        order={index}
      />
    )
  })
})

type GroupProps = {
  group: Minecraft.Group
  minecraftGeometry: Minecraft.Geometry
  texture: THREE.Texture
  order: number
}

const Group = memo(function Group({
  group,
  minecraftGeometry,
  texture,
  order,
}: GroupProps) {
  const pivotX = group.pivot[0]
  const pivotY = group.pivot[1]
  const pivotZ = group.pivot[2] * -1

  return (
    <group
      name={`${group.name} pivot`}
      position={[pivotX, pivotY, pivotZ]}
      rotation={
        group.rotation
          ? new THREE.Euler(
              (group.rotation[0] * Math.PI) / 180,
              -(group.rotation[1] * Math.PI) / 180,
              -(group.rotation[2] * Math.PI) / 180,
              'ZYX',
            )
          : undefined
      }
    >
      <group
        name={group.name}
        renderOrder={order}
        position={[-pivotX, -pivotY, -pivotZ]}
      >
        {group.children.map((childGroup, index) => (
          <Group
            key={childGroup.name}
            group={{
              ...childGroup,
            }}
            minecraftGeometry={minecraftGeometry}
            texture={texture}
            order={index}
          />
        ))}
        {group.cubes &&
          group.cubes.map((cube, index) => (
            <Cube
              key={index}
              cube={{
                ...cube,
                mirror: cube.mirror === undefined ? group.mirror : cube.mirror,
              }}
              group={group}
              minecraftGeometry={minecraftGeometry}
              texture={texture}
            />
          ))}
      </group>
    </group>
  )
})

type CubeProps = {
  cube: Minecraft.Cube
  group: Minecraft.Group
  minecraftGeometry: Minecraft.Geometry
  texture: THREE.Texture
}

const Cube = memo(function Cube({
  cube,
  minecraftGeometry,
  group,
  texture,
}: CubeProps) {
  const { texture_width, texture_height, identifier } =
    minecraftGeometry.description

  const [width, height, depth] = cube.size

  const geometry = new THREE.BoxGeometry(
    cube.inflate ? width + cube.inflate * 2 : width,
    cube.inflate ? height + cube.inflate * 2 : height,
    cube.inflate ? depth + cube.inflate * 2 : depth,
  )

  const u = cube.uv[0]
  const v = texture_height - cube.uv[1] - height - depth

  function uvFace(
    originX: number,
    originY: number,
    deltaX: number,
    deltaY: number,
    options?: { flipX?: boolean; flipY?: boolean },
  ): Minecraft.UV[] {
    const topLeft: Minecraft.UV = [originX, originY + deltaY]
    const topRight: Minecraft.UV = [originX + deltaX, originY + deltaY]
    const bottomLeft: Minecraft.UV = [originX, originY]
    const bottomRight: Minecraft.UV = [originX + deltaX, originY]

    let face = [topLeft, topRight, bottomLeft, bottomRight]

    if (options?.flipX) {
      const faceCopy = [...face]
      face = [faceCopy[1], faceCopy[0], faceCopy[3], faceCopy[2]]
    }

    if (options?.flipY) {
      const faceCopy = [...face]
      face = [faceCopy[2], faceCopy[3], faceCopy[0], faceCopy[1]]
    }

    return face
  }

  const faces = {
    right: uvFace(u, v, depth, height, { flipX: cube.mirror }),
    front: uvFace(u + depth, v, width, height, { flipX: cube.mirror }),
    left: uvFace(u + depth + width, v, depth, height, { flipX: cube.mirror }),
    back: uvFace(u + depth * 2 + width, v, width, height, {
      flipX: cube.mirror,
    }),
    top: uvFace(u + depth, v + height, width, depth, { flipX: cube.mirror }),
    bottom: uvFace(u + depth + width, v + height, width, depth, {
      flipX: cube.mirror,
      flipY: true,
    }),
  }

  const faceArray: Minecraft.UV[][] = [faces.left, faces.right]
  if (cube.mirror) faceArray.reverse()
  faceArray.push(faces.top, faces.bottom, faces.front, faces.back)

  let vectorIndex = 0
  faceArray.forEach(vectors => {
    vectors.forEach(vector => {
      const [u, v] = vector
      geometry.attributes.uv.setXY(
        vectorIndex++,
        u / texture_width,
        v / texture_height,
      )
    })
  })

  let name = group.name
  if (!!cube.inflate) name = `${name} Layer`

  return (
    <mesh
      name={name}
      position={[
        cube.origin[0] + cube.size[0] / 2,
        cube.origin[1] + cube.size[1] / 2,
        (cube.origin[2] + cube.size[2] / 2) * -1,
      ]}
      geometry={geometry}
    >
      <meshStandardMaterial
        map={texture}
        transparent={!identifier.includes('player') || !!cube.inflate}
        alphaTest={0.000000000000000000001}
        side={
          !identifier.includes('player') || !!cube.inflate
            ? THREE.DoubleSide
            : THREE.FrontSide
        }
      />
    </mesh>
  )
})

export default App
