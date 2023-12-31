import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import { useState } from 'react'
import { MathUtils } from 'three'
import Model from './Model'
import RotationCube from './RotationCube'

export default function Scene() {
  const [rotation, setRotation] = useState<Minecraft.XYZ>([
    Math.PI / 8,
    Math.PI / 8,
    0,
  ])

  const bind = useDrag(
    ({ delta }) => {
      const [dx, dy] = delta
      const newRotation: [number, number, number] = [...rotation]
      newRotation[0] += dy / 40
      newRotation[0] = MathUtils.clamp(
        newRotation[0],
        -Math.PI / 2,
        Math.PI / 2,
      )
      newRotation[1] += dx / 40
      setRotation(newRotation)
    },
    { pointer: { lock: true } },
  )

  return (
    <>
      <Canvas flat id='scene' frameloop='demand'>
        <Model rotation={rotation} />
      </Canvas>
      <div
        className='absolute right-4 top-4 h-32 w-32 cursor-grab border border-black bg-white/10 active:cursor-grabbing'
        {...bind()}
      >
        <Canvas flat frameloop='demand'>
          <OrthographicCamera makeDefault position={[0, 0, 200]} />
          <RotationCube rotation={rotation} />
        </Canvas>
      </div>
    </>
  )
}
