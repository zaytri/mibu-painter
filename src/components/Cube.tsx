import { useBoneGroup } from '@/contexts/bone-group/useBoneGroup'
import useBrush from '@/contexts/brush/useBrush'
import { useModel } from '@/contexts/model/useModel'
import { createGridPoints, createTextureGeometry } from '@/helpers/cubeMath'
import { texture } from '@/helpers/texture'
import { Line, Outlines } from '@react-three/drei'
import { memo, useRef } from 'react'
import { DoubleSide } from 'three'

const Cube = memo(function Cube(cube: Minecraft.Cube) {
  const { overCube } = useBrush()
  const { model } = useModel()
  const bone = useBoneGroup()
  const hover = overCube(cube)

  const { texture_width, texture_height } = model.description
  const textureGeometryRef = useRef(
    createTextureGeometry(cube, texture_width, texture_height),
  )

  const { edgePoints, innerPoints } = createGridPoints(cube)
  const name = cube.inflate ? `${bone.name} Layer` : bone.name
  const hoverColor = 'black'

  return (
    <group
      position={[
        cube.origin[0] + cube.size[0] / 2,
        cube.origin[1] + cube.size[1] / 2,
        (cube.origin[2] + cube.size[2] / 2) * -1,
      ]}
    >
      <mesh
        userData={{ type: 'cube' }}
        name={name}
        geometry={textureGeometryRef.current}
      >
        <meshBasicMaterial
          map={texture}
          alphaTest={0.000000000000000000001}
          side={DoubleSide}
          transparent
        />

        <Outlines
          visible={hover}
          color='white'
          transparent
          thickness={0.01}
          opacity={0.2}
          renderOrder={2}
        />
        <Outlines
          color='white'
          transparent
          opacity={0.2}
          renderOrder={3}
          thickness={0.01}
        />
      </mesh>
      <group name='hover grid' scale={1.001} renderOrder={5}>
        <Line
          visible={hover}
          points={innerPoints}
          color={hoverColor}
          opacity={0.2}
          transparent
          segments
          lineWidth={1}
        />
        <Line
          visible={hover}
          points={edgePoints}
          color={hoverColor}
          transparent
          lineWidth={2}
          segments
        />
      </group>
    </group>
  )
})

export default Cube
