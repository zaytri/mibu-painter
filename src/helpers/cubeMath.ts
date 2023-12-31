import { BoxGeometry } from 'three'

export function createGridPoints(cube: Minecraft.Cube) {
  const [xSegments, ySegments, zSegments] = cube.size
  const [cubeWidth, cubeHeight, cubeDepth] = cubeDimensions(cube)

  const edgePoints: Minecraft.XYZ[] = []
  const innerPoints: Minecraft.XYZ[] = []

  function translatePoint(point: Minecraft.XYZ): Minecraft.XYZ {
    const [x, y, z] = point
    return [x - cubeWidth / 2, y - cubeHeight / 2, z - cubeDepth / 2]
  }

  function addLine(
    array: Minecraft.XYZ[],
    point1: Minecraft.XYZ,
    point2: Minecraft.XYZ,
  ) {
    array.push(translatePoint(point1), translatePoint(point2))
  }

  function addCorner(point: Minecraft.XYZ) {
    const [x, y, z] = point
    addLine(edgePoints, point, [Math.abs(x - cubeWidth), y, z])
    addLine(edgePoints, point, [x, Math.abs(y - cubeHeight), z])
    addLine(edgePoints, point, [x, y, Math.abs(z - cubeDepth)])
  }

  addCorner([0, 0, 0])
  addCorner([cubeWidth, 0, cubeDepth])
  addCorner([cubeWidth, cubeHeight, 0])
  addCorner([0, cubeHeight, cubeDepth])

  function addSquare(
    ...points: [Minecraft.XYZ, Minecraft.XYZ, Minecraft.XYZ, Minecraft.XYZ]
  ) {
    addLine(innerPoints, points[0], points[1])
    addLine(innerPoints, points[0], points[2])
    addLine(innerPoints, points[3], points[1])
    addLine(innerPoints, points[3], points[2])
  }

  for (let i = 1; i < xSegments; i++) {
    const x = (i * cubeWidth) / xSegments
    addSquare(
      [x, 0, 0],
      [x, cubeHeight, 0],
      [x, 0, cubeDepth],
      [x, cubeHeight, cubeDepth],
    )
  }

  for (let i = 1; i < ySegments; i++) {
    const y = (i * cubeHeight) / ySegments
    addSquare(
      [0, y, 0],
      [cubeWidth, y, 0],
      [0, y, cubeDepth],
      [cubeWidth, y, cubeDepth],
    )
  }

  for (let i = 1; i < zSegments; i++) {
    const z = (i * cubeDepth) / zSegments
    addSquare(
      [0, 0, z],
      [cubeWidth, 0, z],
      [0, cubeHeight, z],
      [cubeWidth, cubeHeight, z],
    )
  }

  return { edgePoints, innerPoints }
}

export function createTextureGeometry(
  cube: Minecraft.Cube,
  textureWidth: number,
  textureHeight: number,
) {
  const [width, height, depth] = cube.size
  const [cubeWidth, cubeHeight, cubeDepth] = cubeDimensions(cube)

  const geometry = new BoxGeometry(cubeWidth, cubeHeight, cubeDepth)

  const u = cube.uv[0]
  const v = textureHeight - cube.uv[1] - height - depth
  const faces = uvFaces(u, v, width, height, depth, cube.mirror)

  let vectorIndex = 0
  faces.forEach(vectors => {
    vectors.forEach(vector => {
      const [u, v] = vector
      geometry.attributes.uv.setXY(
        vectorIndex++,
        u / textureWidth,
        v / textureHeight,
      )
    })
  })

  return geometry
}

function cubeDimensions(cube: Minecraft.Cube) {
  if (!cube.inflate) return cube.size

  return cube.size.map(value => {
    return value + cube.inflate! * 2
  })
}

function uvFaces(
  u: number,
  v: number,
  width: number,
  height: number,
  depth: number,
  mirror: boolean = false,
) {
  const faces = {
    right: uvFace(u, v, depth, height, { flipX: mirror }),
    front: uvFace(u + depth, v, width, height, { flipX: mirror }),
    left: uvFace(u + depth + width, v, depth, height, { flipX: mirror }),
    back: uvFace(u + depth * 2 + width, v, width, height, {
      flipX: mirror,
    }),
    top: uvFace(u + depth, v + height, width, depth, { flipX: mirror }),
    bottom: uvFace(u + depth + width, v + height, width, depth, {
      flipX: mirror,
      flipY: true,
    }),
  }

  const faceArray: Minecraft.UV[][] = [faces.left, faces.right]
  if (mirror) faceArray.reverse()
  faceArray.push(faces.top, faces.bottom, faces.front, faces.back)
  return faceArray
}

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
