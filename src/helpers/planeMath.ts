export function createGridPoints(
  width: number,
  height: number,
): Minecraft.XYZ[] {
  const grid: Minecraft.UV[] = []

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
): Minecraft.XYZ[] {
  const [width, height, depth] = cube.size
  const [x, y] = cube.uv

  const outline: Minecraft.UV[] = []

  const points: Minecraft.UV[] = []

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
