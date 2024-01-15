import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import { useState } from 'react'
import { MathUtils } from 'three'
import Model from './Model'
import Rotater from './Rotater'

export default function Scene() {
  const [rotation, setRotation] = useState<Mibu.Vector3>([
    Math.PI / 8,
    -Math.PI / 4,
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
    { pointer: { lock: false } },
  )

  const dpr = (window.devicePixelRatio || 1) * 3

  return (
    <>
      <Canvas flat id='scene' frameloop='demand' dpr={dpr}>
        <Model rotation={rotation} />
      </Canvas>
      <div
        className='absolute right-4 top-4 h-36 w-36 rounded-full border border-black bg-white/10 active:cursor-grabbing'
        {...bind()}
      >
        <Canvas flat frameloop='demand' dpr={dpr}>
          <OrthographicCamera makeDefault position={[0, 0, 200]} />
          <Rotater rotation={rotation} setRotation={setRotation} />
        </Canvas>
      </div>
    </>
  )
}
