import useBrush from '@/contexts/brush/useBrush'
import { useLayers } from '@/contexts/layers/useLayers'
import { useModel } from '@/contexts/model/useModel'
import { createGridPoints, createOutlinePoints } from '@/helpers/planeMath'
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
import { Vector3 } from 'three'
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
  const minZoom = Math.floor(Math.min(size.width, size.height))
  const maxZoom = (minZoom * Math.max(width, height)) / 8
  const controlsRef = useRef<OrbitControlsType>(null)
  const gridPoints = createGridPoints(width, height)
  const outlinePoints: Minecraft.XYZ[] = []
  const selectedOutlinePoints: Minecraft.XYZ[] = []
  model.bones.forEach(bone => {
    if (!bone.cubes) return
    bone.cubes.forEach(cube => {
      const points = createOutlinePoints(cube, width, height)
      if (overCube(cube)) selectedOutlinePoints.push(...points)
      outlinePoints.push(...points)
    })
  })

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    function onChange() {
      const controls = controlsRef.current
      if (!controls) return
      const { target } = controls

      const [panLimitX, panLimitY] = [size.width, size.height].map(bound => {
        return Math.abs((1 - bound / camera.zoom) * 0.5)
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
        <Plane>
          <meshBasicMaterial color='white' transparent opacity={0.1} />
        </Plane>
        <Plane userData={{ type: 'cube' }}>
          <meshBasicMaterial map={texture} transparent alphaTest={0.0000001} />
        </Plane>
        <group rotation={[Math.PI, 0, 0]}>
          <Line
            points={gridPoints}
            segments
            transparent
            lineWidth={1}
            opacity={0.2}
          />
          <Line points={outlinePoints} segments transparent lineWidth={5} />
          <Line
            points={selectedOutlinePoints}
            color='white'
            segments
            transparent
            renderOrder={2}
            lineWidth={5}
          />
        </group>
      </group>
    </group>
  )
}
