import { CanvasTexture, NearestFilter } from 'three'

export const textureCanvas = new OffscreenCanvas(1, 1)

export const texture = new CanvasTexture(
  textureCanvas,
  undefined,
  undefined,
  undefined,
  NearestFilter,
  NearestFilter,
)
