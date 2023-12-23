import * as THREE from 'three'
type XY = [x: number, y: number]

export class MinecraftUVMap {
  readonly x: number
  readonly y: number
  readonly dx: number
  readonly dy: number

  constructor(bottomLeftCoords: XY, size: XY) {
    this.x = bottomLeftCoords[0] / 64
    this.y = bottomLeftCoords[1] / 64
    this.dx = size[0] / 64
    this.dy = size[1] / 64
  }

  get topLeft(): XY {
    return [this.x, this.y + this.dy]
  }

  get topRight(): XY {
    return [this.x + this.dx, this.y + this.dy]
  }

  get bottomLeft(): XY {
    return [this.x, this.y]
  }

  get bottomRight(): XY {
    return [this.x + this.dx, this.y]
  }
}

export function MinecraftGeometry(
  dimensions: [number, number, number],
  uvMaps: {
    left: MinecraftUVMap
    right: MinecraftUVMap
    top: MinecraftUVMap
    bottom: MinecraftUVMap
    front: MinecraftUVMap
    back: MinecraftUVMap
  },
) {
  const [width, height, depth] = dimensions
  const { left, right, top, bottom, front, back } = uvMaps
  const geometry = new THREE.BoxGeometry(width, height, depth)
  let vectorIndex = 0
  Array(left, right, top, bottom, front, back).forEach((uvMap, index) => {
    const vectors =
      index === 3 // bottom
        ? [uvMap.bottomLeft, uvMap.bottomRight, uvMap.topLeft, uvMap.topRight]
        : [uvMap.topLeft, uvMap.topRight, uvMap.bottomLeft, uvMap.bottomRight]
    vectors.forEach(xy => {
      const [x, y] = xy
      geometry.attributes.uv.setXY(vectorIndex++, x, y)
    })
  })
  return geometry
}
