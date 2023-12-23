namespace Minecraft {
  type Model = {
    format_version: string
    'minecraft:geometry': Geometry[]
  }

  type XYZ = [number, number, number]
  type UV = [number, number]

  type Geometry = {
    description: {
      identifier: string
      texture_width: number
      texture_height: number
      visible_bounds_width: number
      visible_bounds_height: number
      visible_bounds_offset: number[]
    }
    bones: Bone[]
  }

  type Bone = {
    name: string
    parent?: string
    pivot: number[]
    rotation?: number[]
    mirror?: boolean
    cubes?: Cube[]
  }

  type Cube = {
    origin: number[]
    size: number[]
    pivot?: number[]
    rotation?: number[]
    inflate?: number
    uv: number[]
    mirror?: boolean
  }

  type BoneMap = Map<string, Bone>

  type Group = Bone & {
    children: Group[]
  }
}
