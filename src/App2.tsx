import axolotlModel from '@/models/axolotl.geo.json'
import camelModel from '@/models/camel.geo.json'
import dragonModel from '@/models/ender_dragon.geo.json'
import guardianModel from '@/models/guardian.geo.json'
import playerModel from '@/models/player.geo.json'
import playerSlimModel from '@/models/player_slim.geo.json'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
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

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function Model() {
  const canvasPainterRef = useRef<HTMLCanvasElement>(null)
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null)
  useEffect(() => {
    if (!canvasPainterRef.current) return

    canvasTextureRef.current = new THREE.CanvasTexture(canvasPainterRef.current)
    canvasTextureRef.current.magFilter = THREE.NearestFilter
    canvasTextureRef.current.minFilter = THREE.NearestFilter
  }, [!!canvasPainterRef.current])

  const images = [
    // 'skin.png',
    // 'skin2.png',
    'camel.png',
    // 'axolotl_blue.png',
    // 'axolotl_cyan.png',
    // 'axolotl_gold.png',
    // 'axolotl_lucy.png',
    // 'axolotl_wild.png',
    // 'guardian.png',
    // 'dragon.png',
  ]

  const textures = images.map(image => {
    return useLoader(THREE.TextureLoader, image)
  })

  const models = [
    // playerSlimModel,
    // playerModel,
    camelModel,
    // axolotlModel,
    // axolotlModel,
    // axolotlModel,
    // axolotlModel,
    // axolotlModel,
    // guardianModel,
    // dragonModel,
  ]
  textures.forEach(texture => {
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
  })

  const [toggled, setToggled] = useState(false)
  const [index, setIndex] = useState(0)
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

  const modelGeometry = models[index]['minecraft:geometry'][0]
  modelGeometry.bones.forEach(bone => {
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
    <div className='h-full w-full border border-white'>
      <Canvas frameloop='demand' {...bind()} className=' touch-none'>
        {/* <ambientLight intensity={3} /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}
        <group
          rotation={rotation}
          position={[0, 0, cameraDistance]}
          renderOrder={10}
        >
          <axesHelper args={[500]} visible={false} />
          <gridHelper
            args={[256, 32]}
            position={[
              -(modelMaxCoords[0] + modelMinCoords[0]) / 2,
              -(modelMaxCoords[1] + modelMinCoords[1]) / 2,
              (modelMaxCoords[2] + modelMinCoords[2]) / 2,
            ]}
          />
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
            {canvasTextureRef.current && (
              <MinecraftModel
                model={models[index]}
                texture={textures[index]}
                canvasTexture={canvasTextureRef.current}
                scale={1}
              />
            )}
          </group>
        </group>
        {canvasPainterRef.current && canvasTextureRef.current ? (
          <Painter
            canvas={canvasPainterRef.current}
            texture={canvasTextureRef.current}
          />
        ) : null}
      </Canvas>
      <div className='pointer-events-none absolute left-4 top-4 origin-top-left scale-[4] bg-white/25'>
        <img
          className='painter'
          src={images[index]}
          width={modelGeometry.description.texture_width}
          height={modelGeometry.description.texture_height}
        />
        <canvas
          ref={canvasPainterRef}
          className='painter absolute left-0 top-0'
          width={modelGeometry.description.texture_width}
          height={modelGeometry.description.texture_height}
        />
      </div>
      <button
        className='absolute right-4 top-4 rounded-md bg-white p-2'
        onClick={() => {
          setToggled(!toggled)
          if (rotateIndex) setIndex((index + 1) % models.length)
        }}
      >
        Next Model
      </button>
    </div>
  )
}

type PainterProps = {
  canvas: HTMLCanvasElement
  texture: THREE.CanvasTexture
}

const Painter = memo(function Painter({ canvas, texture }: PainterProps) {
  const { scene, camera, invalidate } = useThree()
  const [x, setX] = useState<number | null>(null)
  const [y, setY] = useState<number | null>(null)
  const context = canvas.getContext('2d')!

  useEffect(() => {
    function setXY(x: number, y: number) {
      setX(x)
      setY(y)
    }

    function clearXY() {
      setX(null)
      setY(null)
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const objects: THREE.Object3D[] = []
      scene.traverse(object => {
        if (object.userData.type === 'cube') objects.push(object)
      })

      const intersects = raycaster.intersectObjects(objects, false)

      if (intersects.length) {
        let intersect: THREE.Intersection | null = null

        for (const i of intersects) {
          if (i.uv && i.normal && i.face && i.normal.equals(i.face.normal)) {
            intersect = i
            break
          }
        }

        if (intersect && intersect.uv) {
          const { uv } = intersect
          setXY(
            Math.floor(uv.x * canvas.width),
            canvas.height - Math.ceil(uv.y * canvas.height),
          )
        }
      } else {
        clearXY()
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  useEffect(() => {
    context.clearRect(0, 0, canvas.width, canvas.height)

    if (x !== null && y !== null) {
      context.fillStyle = 'red'
      context.fillRect(x, y, 1, 1)
    }

    texture.needsUpdate = true
    invalidate()
  }, [x, y])

  return null
})

type MinecraftModelProps = {
  model: Minecraft.Model
  texture: THREE.Texture
  canvasTexture: THREE.CanvasTexture
  scale: number
}

const MinecraftModel = memo(function MinecraftModel({
  model,
  texture,
  canvasTexture,
}: MinecraftModelProps) {
  const [minecraftGeometry] = model['minecraft:geometry']

  const boneMap: Minecraft.BoneMap = new Map()
  minecraftGeometry.bones.forEach(bone => {
    boneMap.set(bone.name, { ...bone })
  })

  const groups: Minecraft.BoneGroup[] = []
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

      let parentGroup: Minecraft.BoneGroup | null = null
      parents.reverse().forEach(parentName => {
        const groupArray = parentGroup ? parentGroup.children : groups
        parentGroup = groupArray.find(group => group.name === parentName)!
      })

      parentGroup!.children.push({ ...bone, children: [] })
    }
  })

  return groups.map(group => {
    return (
      <Group
        key={group.name}
        group={group}
        minecraftGeometry={minecraftGeometry}
        texture={texture}
        canvasTexture={canvasTexture}
      />
    )
  })
})

type GroupProps = {
  group: Minecraft.BoneGroup
  minecraftGeometry: Minecraft.Geometry
  texture: THREE.Texture
  canvasTexture: THREE.CanvasTexture
}

const Group = memo(function Group({
  group,
  minecraftGeometry,
  texture,
  canvasTexture,
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
      <group name={group.name} position={[-pivotX, -pivotY, -pivotZ]}>
        {group.children.map((childGroup, index) => (
          <Group
            key={childGroup.name}
            group={{
              ...childGroup,
            }}
            minecraftGeometry={minecraftGeometry}
            texture={texture}
            canvasTexture={canvasTexture}
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
              canvasTexture={canvasTexture}
            />
          ))}
      </group>
    </group>
  )
})

type CubeProps = {
  cube: Minecraft.Cube
  group: Minecraft.BoneGroup
  minecraftGeometry: Minecraft.Geometry
  texture: THREE.Texture
  canvasTexture: THREE.CanvasTexture
}

const Cube = memo(function Cube({
  cube,
  minecraftGeometry,
  group,
  texture,
  canvasTexture,
}: CubeProps) {
  const { texture_width, texture_height, identifier } =
    minecraftGeometry.description

  const [width, height, depth] = cube.size

  const geometry = new THREE.BoxGeometry(
    cube.inflate ? width + cube.inflate * 2 : width,
    cube.inflate ? height + cube.inflate * 2 : height,
    cube.inflate ? depth + cube.inflate * 2 : depth,
  )

  const boundingGeometry = new THREE.BoxGeometry(
    cube.inflate ? width + cube.inflate * 2 : width,
    cube.inflate ? height + cube.inflate * 2 : height,
    cube.inflate ? depth + cube.inflate * 2 : depth,
    width,
    height,
    depth,
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

  const position: [number, number, number] = [
    cube.origin[0] + cube.size[0] / 2,
    cube.origin[1] + cube.size[1] / 2,
    (cube.origin[2] + cube.size[2] / 2) * -1,
  ]

  return (
    <group position={position}>
      <mesh userData={{ type: 'cube' }} name={name} geometry={geometry}>
        <meshBasicMaterial
          map={texture}
          transparent={!identifier.includes('player') || !!cube.inflate}
          alphaTest={0.000000000000000000001}
          side={
            !identifier.includes('player') || !!cube.inflate
              ? THREE.DoubleSide
              : THREE.FrontSide
          }
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          map={canvasTexture}
          transparent
          alphaTest={0.000000000000000000001}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
})

export default App
