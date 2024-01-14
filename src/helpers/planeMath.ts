export function createGridPoints(
  width: number,
  height: number,
): Mibu.Vector3[] {
  const grid: Mibu.Vector2[] = []

  for (let i = 0; i <= width; i++) {
    const x = i / width
    grid.push([x, 0], [x, 1])
  }

  for (let i = 0; i <= height; i++) {
    const y = i / height
    grid.push([0, y], [1, y])
  }

  return grid.map(([x, y]) => [x - 0.5, y - 0.5, 0])
}

export function createOutlinePoints(
  cube: Minecraft.Cube,
  textureWidth: number,
  textureHeight: number,
): Mibu.Vector3[] {
  const [width, height, depth] = cube.size
  const [x, y] = cube.uv
  const outline: Mibu.Vector2[] = []
  const points: Mibu.Vector2[] = []

  // upper rectangle
  if (width && depth) {
    points.push(
      [x + depth, y + depth], // bottom left
      [x + depth, y], // top left
      [x + width * 2 + depth, y], // top right
      [x + width * 2 + depth, y + depth], // bottom right
    )
  }

  // lower rectangle
  if (height) {
    points.push(
      [x + width * 2 + depth * 2, y + depth], // top right
      [x + width * 2 + depth * 2, y + depth + height], // bottom right
      [x, y + depth + height], // bottom left
      [x, y + depth], // top left
    )
  }

  points.forEach((point, index) => {
    const point2 = points[(index + 1) % points.length]
    outline.push(point, point2)
  })

  return outline.map(([x, y]) => [
    x / textureWidth - 0.5,
    y / textureHeight - 0.5,
    0,
  ])
}

export function createBetweenPoints(
  cube: Minecraft.Cube,
  textureWidth: number,
  textureHeight: number,
): Mibu.Vector3[] {
  const [width, height, depth] = cube.size
  const [x, y] = cube.uv
  const points: Mibu.Vector2[] = []

  // upper rectangle middle line
  if (width && depth) {
    points.push([x + depth + width, y], [x + depth + width, y + depth])
  }

  // lower rectangle
  if (height) {
    // left line
    if (depth) {
      points.push([x + depth, y + depth], [x + depth, y + depth + height])
    }

    if (width) {
      // middle line
      points.push(
        [x + depth + width, y + depth],
        [x + depth + width, y + depth + height],
      )
    }

    if (depth && width) {
      // right line
      points.push(
        [x + depth * 2 + width, y + depth],
        [x + depth * 2 + width, y + depth + height],
      )
    }
  }

  // in between line
  if (width && depth && height) {
    points.push([x + depth, y + depth], [x + depth + width * 2, y + depth])
  }

  return points.map(([x, y]) => [
    x / textureWidth - 0.5,
    y / textureHeight - 0.5,
    0,
  ])
}

export function createOutlinePlanes(points: Mibu.Vector3[]): Mibu.Vector4[] {
  const planes: Mibu.Vector4[] = []

  for (let i = 0; i < points.length; i += 8) {
    const xSet = new Set<number>()
    const ySet = new Set<number>()
    for (let j = 0; j < 8; j++) {
      const [x, y] = points[i + j]
      xSet.add(x)
      ySet.add(y)
    }
    const xArray = Array.from(xSet)
    const yArray = Array.from(ySet)

    const size: Mibu.Vector2 = [
      Math.abs(xArray[0] - xArray[1]),
      Math.abs(yArray[0] - yArray[1]),
    ]
    const position: Mibu.Vector2 = [
      Math.min(...xArray) + size[0] / 2,
      Math.min(...yArray) + size[1] / 2,
    ]

    planes.push([...position, ...size])
  }

  return planes
}
