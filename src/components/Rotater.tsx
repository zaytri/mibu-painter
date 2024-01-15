import { Billboard, Line, Plane, Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useState } from 'react'
import { Raycaster, Vector2, type Object3D } from 'three'

const distanceFromOrigin = 50
const raycaster = new Raycaster()
const pointer = new Vector2()

type Direction = 'front' | 'back' | 'left' | 'right' | 'up' | 'down'

type RotaterProps = {
  rotation: Mibu.Vector3
  setRotation: (rotation: Mibu.Vector3) => void
}

const HoverContext = createContext<Direction | null>(null)

export default function Rotater({ rotation, setRotation }: RotaterProps) {
  const { scene, camera, size, gl } = useThree()
  const [hover, setHover] = useState<Direction | null>(null)

  useEffect(() => {
    function raycast(event: PointerEvent) {
      pointer.x = ((event.clientX - size.left) / size.width) * 2 - 1
      pointer.y = -((event.clientY - size.top) / size.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const objects: Object3D[] = []
      scene.traverse(object => {
        if (object.userData.type === 'direction') {
          objects.push(object)
        }
      })

      const intersects = raycaster.intersectObjects(objects, false)

      if (intersects.length) {
        setHover(intersects[0].object.userData.direction)
      } else {
        setHover(null)
      }
    }

    function rotateToHover() {
      if (!hover) return

      switch (hover) {
        case 'front':
          setRotation([0, 0, 0])
          break
        case 'back':
          setRotation([0, Math.PI, 0])
          break
        case 'left':
          setRotation([0, -Math.PI / 2, 0])
          break
        case 'right':
          setRotation([0, Math.PI / 2, 0])
          break
        case 'up':
          setRotation([Math.PI / 2, 0, 0])
          break
        case 'down':
          setRotation([-Math.PI / 2, 0, 0])
          break
      }
    }

    gl.domElement.addEventListener('pointermove', raycast)
    addEventListener('click', rotateToHover)

    return () => {
      gl.domElement.removeEventListener('pointermove', raycast)
      removeEventListener('click', rotateToHover)
    }
  })

  return (
    <HoverContext.Provider value={hover}>
      <group rotation={rotation}>
        <Direction
          color='#84DCFF'
          direction='front'
          position={[0, 0, distanceFromOrigin]}
        />
        <Direction
          color='#84DCFF'
          direction='back'
          position={[0, 0, -distanceFromOrigin]}
        />
        <Direction
          color='#FF77A4'
          direction='left'
          position={[distanceFromOrigin, 0, 0]}
        />
        <Direction
          color='#FF77A4'
          direction='right'
          position={[-distanceFromOrigin, 0, 0]}
        />
        <Direction
          color='#caffbf'
          direction='up'
          position={[0, distanceFromOrigin, 0]}
        />
        <Direction
          color='#caffbf'
          direction='down'
          position={[0, -distanceFromOrigin, 0]}
        />
      </group>
    </HoverContext.Provider>
  )
}

type DirectionProps = {
  color: string
  direction: Direction
  position: Mibu.Vector3
}

function Direction({ color, direction, position }: DirectionProps) {
  const hover = useContext(HoverContext)
  const hovering = hover === direction
  const negative = position[0] + position[1] + position[2] < 0

  return (
    <>
      <Line
        points={[[0, 0, 0], position]}
        lineWidth={4}
        color={hovering ? 'white' : color}
        transparent
        opacity={negative ? 0.25 : 1}
        scale={0.75}
      />
      <Billboard position={position}>
        <Plane
          args={[25, 25]}
          scale={hovering ? 1.2 : 1}
          userData={{ type: 'direction', direction }}
        >
          <meshBasicMaterial color={hovering ? 'white' : color} />
        </Plane>
        <Text
          color='black'
          font='/fonts/Minecraft.otf'
          fontSize={20}
          position={[0, -2, 0]}
          renderOrder={3}
          scale={hovering ? 1.2 : 1}
        >
          {direction.charAt(0).toUpperCase()}
        </Text>
      </Billboard>
    </>
  )
}
