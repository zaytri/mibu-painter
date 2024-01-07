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

  const points: Minecraft.UV[] = [
    [x + width * 2 + depth * 2, y + depth + height],
    [x + width * 2 + depth * 2, y + depth],
    [x + width * 2 + depth, y + depth],
    [x + width * 2 + depth, y],
    [x + depth, y],
    [x + depth, y + depth],
    [x, y + depth],
    [x, y + depth + height],
  ]

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
