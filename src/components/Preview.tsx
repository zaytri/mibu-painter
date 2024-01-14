import useBrush from '@/contexts/brush/useBrush'
import { useLayers } from '@/contexts/layers/useLayers'
import { useModel } from '@/contexts/model/useModel'
import {
  createBetweenPoints,
  createGridPoints,
  createOutlinePlanes,
  createOutlinePoints,
} from '@/helpers/planeMath'
import { texture } from '@/helpers/texture'
import useRaycaster from '@/hooks/useRaycaster'
import {
  Line,
  OrbitControls,
  OrthographicCamera,
  Plane,
} from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { BackSide, Vector3 } from 'three'
import { type OrbitControls as OrbitControlsType } from 'three-stdlib'

export default function Preview() {
  const dpr = (window.devicePixelRatio || 1) * 3

  return (
    <Canvas flat frameloop='demand' dpr={dpr}>
      <PreviewScene />
    </Canvas>
  )
}

const minPan = new Vector3()
const maxPan = new Vector3()

function PreviewScene() {
  useRaycaster()
  const { size, camera } = useThree()
  const { width, height } = useLayers()
  const { model } = useModel()
  const { overCube } = useBrush()
  const minZoom = Math.floor(Math.min(size.width, size.height)) / 2
  const maxZoom = (minZoom * Math.max(width, height)) / 8
  const controlsRef = useRef<OrbitControlsType>(null)
  const gridPoints = createGridPoints(width, height)
  const outlinePoints: Mibu.Vector3[] = []
  const selectedOutlinePoints: Mibu.Vector3[] = []
  const selectedBetweenPoints: Mibu.Vector3[] = []

  model.bones.forEach(bone => {
    if (!bone.cubes) return
    bone.cubes.forEach(cube => {
      const points = createOutlinePoints(cube, width, height)
      if (overCube(cube)) {
        selectedOutlinePoints.push(...points)
        selectedBetweenPoints.push(...createBetweenPoints(cube, width, height))
      }
      outlinePoints.push(...points)
    })
  })

  const outlinePlanes = createOutlinePlanes(outlinePoints)
  const selectedOutlinePlanes = createOutlinePlanes(selectedOutlinePoints)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    function onChange() {
      const controls = controlsRef.current
      if (!controls) return
      const { target } = controls

      const [panLimitX, panLimitY] = [size.width, size.height].map(bound => {
        return Math.abs((1 - bound / camera.zoom) * 0.5) + 0.25
      })

      minPan.set(-panLimitX, -panLimitY, 0)
      maxPan.set(panLimitX, panLimitY, 0)

      target.clamp(minPan, maxPan)
      camera.position.copy(target)
    }

    onChange()

    controls.addEventListener('change', onChange)

    return () => {
      controls.removeEventListener('change', onChange)
    }
  }, [controlsRef.current, size])

  return (
    <group>
      <OrbitControls
        enableDamping={false}
        enableRotate={false}
        zoomToCursor
        minZoom={minZoom}
        maxZoom={maxZoom}
        ref={controlsRef}
      />
      <OrthographicCamera
        makeDefault
        args={[-1, 1, -1, 1, -1, 1]}
        zoom={minZoom}
      />
      <group>
        <Plane userData={{ type: 'cube' }} renderOrder={1}>
          <meshBasicMaterial map={texture} transparent alphaTest={0.0000001} />
        </Plane>

        <group rotation={[Math.PI, 0, 0]}>
          {outlinePlanes.map(plane => {
            const [x, y, width, height] = plane
            return (
              <OutlinePlane
                key={plane.join('-')}
                x={x}
                y={y}
                width={width}
                height={height}
              />
            )
          })}
          {selectedOutlinePlanes.map(plane => {
            const [x, y, width, height] = plane
            return (
              <OutlinePlane
                key={plane.join('-')}
                x={x}
                y={y}
                width={width}
                height={height}
              />
            )
          })}
          <Line
            points={gridPoints}
            segments
            transparent
            lineWidth={1}
            renderOrder={2}
            opacity={0.25}
          />
          <Line
            points={outlinePoints}
            segments
            transparent
            color='black'
            lineWidth={5}
            renderOrder={3}
          />
          <Line
            visible={!!selectedOutlinePoints.length}
            points={selectedOutlinePoints}
            color='white'
            segments
            transparent
            renderOrder={4}
            lineWidth={5}
          />
          <Line
            visible={!!selectedBetweenPoints.length}
            points={selectedBetweenPoints}
            color='white'
            segments
            // dashed
            // dashScale={Math.max(width, height) * 4}
            transparent
            opacity={0.5}
            renderOrder={4}
            lineWidth={2}
          />
        </group>
      </group>
    </group>
  )
}

type OutlinePlaneProps = {
  x: number
  y: number
  width: number
  height: number
}

function OutlinePlane(props: OutlinePlaneProps) {
  const { x, y, width, height } = props

  return (
    <Plane args={[width, height]} position={[x, y, 0]}>
      <meshBasicMaterial
        color={'white'}
        transparent
        opacity={0.2}
        side={BackSide}
      />
    </Plane>
  )
}
