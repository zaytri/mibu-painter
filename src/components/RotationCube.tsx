import { createGridPoints } from '@/helpers/cubeMath'
import { Line, Plane, Text } from '@react-three/drei'

type RotationCubeProps = {
  rotation: Mibu.Vector3
}

const size = 75
const textPositionValue = size / 2 + 0.1
const fontSize = 20
const fontColor = 'black'

export default function RotationCube({ rotation }: RotationCubeProps) {
  const { edgePoints } = createGridPoints({
    origin: [0, 0, 0],
    size: [size, size, size],
    uv: [0, 0],
  })

  return (
    <group rotation={rotation}>
      <group name='front' position={[0, 0, textPositionValue]}>
        <Side color='#9bf6ff' />
        <DirectionText>Front</DirectionText>
      </group>
      <group
        name='back'
        position={[0, 0, -textPositionValue]}
        rotation={[0, Math.PI, 0]}
      >
        <Side color='#bdb2ff' />
        <DirectionText>Back</DirectionText>
      </group>
      <group
        name='left'
        position={[textPositionValue, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <Side color='#ffadad' />
        <DirectionText>Left</DirectionText>
      </group>
      <group
        name='right'
        position={[-textPositionValue, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <Side color='#ffd6a5' />
        <DirectionText>Right</DirectionText>
      </group>
      <group
        name='top'
        position={[0, textPositionValue, 0]}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
      >
        <Side color='#caffbf' />
        <group rotation={[0, 0, -rotation[1]]}>
          <DirectionText fontSize={fontSize * 1.25}>Top</DirectionText>
        </group>
      </group>
      <group
        name='bottom'
        position={[0, -textPositionValue, 0]}
        rotation={[-Math.PI / 2, -Math.PI, -Math.PI]}
      >
        <Side color='#fdffb6' />
        <group rotation={[0, 0, rotation[1]]}>
          <DirectionText fontSize={fontSize * 0.75}>Bottom</DirectionText>
        </group>
      </group>
      <Line
        points={edgePoints}
        color='black'
        lineWidth={2}
        segments
        scale={1.01}
      />
    </group>
  )
}

type SideProps = {
  color?: string
}

function Side({ color }: SideProps) {
  return (
    <Plane position={[0, 0, -0.1]} args={[size, size]}>
      <meshBasicMaterial color={color} opacity={0.8} transparent />
    </Plane>
  )
}

type DirectionTextProps = {
  children: string
  fontSize?: number
}

function DirectionText(props: DirectionTextProps) {
  return (
    <Text
      color={fontColor}
      fillOpacity={0.8}
      fontSize={props.fontSize || fontSize}
    >
      {props.children}
    </Text>
  )
}
