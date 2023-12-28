import useBrush from '@/contexts/brush/useBrush'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import Model from './Model'

export default function Scene() {
  const { painting } = useBrush()

  return (
    <Canvas flat id='scene' frameloop='demand'>
      <ambientLight intensity={10} />

      <OrbitControls enablePan={false} enabled={!painting} />
      <Model />
    </Canvas>
  )
}
